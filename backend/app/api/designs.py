"""Designs API endpoints."""

import io
import logging
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image

from app.config import get_settings
from app.schemas.design import Design
from app.services.design_service import DesignService

logger = logging.getLogger(__name__)
router = APIRouter()
design_service = DesignService()
settings = get_settings()

# Mockup template configs: product_type → (template path, design bounding box, blend mode)
# Coordinates are for 1024x1024 photorealistic templates
MOCKUP_TEMPLATES = {
    "shirt": {
        "template": "shirt-template.png",
        "design_box": (330, 310, 370, 370),  # x, y, w, h — chest area on black tee
        "blend": "screen",  # screen blend for light designs on dark fabric
    },
    "sticker": {
        "template": "sticker-template.png",
        "design_box": (270, 210, 470, 530),  # inside the white sticker area
        "blend": "paste",
    },
    "print": {
        "template": "print-template.png",
        "design_box": (225, 225, 575, 500),  # inside the black frame
        "blend": "paste",
    },
}

# Map mockup type → matching product types from metadata
_TYPE_MAP = {
    "shirt": ("shirt", "tshirt", "tee", "hoodie"),
    "sticker": ("sticker",),
    "print": ("print",),
}

# Cache generated mockups in memory: (slug, product_type) → PNG bytes
_mockup_cache: dict[tuple[str, str], bytes] = {}


@router.get("", response_model=list[Design])
async def list_designs(
    status: str = "active",
    category: str | None = None,
    space: str | None = None,
):
    """List all designs."""
    designs = await design_service.list_designs(status=status, category=category, space=space)
    return designs


@router.get("/{slug}", response_model=Design)
async def get_design(slug: str):
    """Get a single design by slug."""
    design = await design_service.get_design(slug)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    return design


@router.get("/{slug}/image")
async def get_design_image(slug: str):
    """Serve the design image."""
    image_path = await design_service.get_design_image_path(slug)
    if not image_path or not Path(image_path).exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        image_path,
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=86400",
        },
    )


@router.get("/{slug}/mockup")
async def get_design_mockup(slug: str, type: str = "shirt", fresh: bool = False):
    """Serve the design composited onto a product mockup template.

    For Printful-provider designs: fetches photorealistic mockup from
    Printful's mockup generator API (cached after first generation).
    For other designs: composites with Pillow using local templates.

    Query params:
        type: Product type — "shirt", "sticker", or "print" (default: shirt)
        fresh: If true, bypass cache and regenerate mockup
    """
    cache_key = (slug, type)
    if not fresh and cache_key in _mockup_cache:
        return StreamingResponse(
            io.BytesIO(_mockup_cache[cache_key]),
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=86400"},
        )

    # Load design to check provider
    design = await design_service.get_design(slug)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")

    # Find a Printful-provider product matching the requested mockup type
    printful_product = None
    accepted_types = _TYPE_MAP.get(type, (type,))
    for p in design.products:
        if p.provider == "printful" and p.type in accepted_types:
            printful_product = p
            break

    # Try Printful mockup API for Printful-provider designs
    if printful_product and settings.printful_api_token:
        png_bytes = await _get_printful_mockup(slug, printful_product)
        if png_bytes:
            _mockup_cache[cache_key] = png_bytes
            return StreamingResponse(
                io.BytesIO(png_bytes),
                media_type="image/png",
                headers={"Cache-Control": "public, max-age=86400"},
            )

    # Fallback: Pillow compositing with local templates
    return await _pillow_mockup(slug, type)


async def _get_printful_mockup(slug: str, product) -> bytes | None:
    """Fetch mockup from Printful API. Returns PNG bytes or None."""
    from app.pod.printful_client import PrintfulClient

    printful = PrintfulClient()
    if not printful.enabled:
        return None

    try:
        product_id = int(product.sku)

        # Get first variant for mockup preview
        variants = await printful.get_catalog_variants(product_id)
        if not variants:
            logger.warning(f"No Printful variants for product {product_id}")
            return None
        variant_ids = [variants[0]["id"]]

        # Public image URL for Printful to download
        image_url = f"https://fungiswag.jeffemmett.com/api/designs/{slug}/image"

        # Generate mockup (blocks up to ~60s on first call)
        mockups = await printful.generate_mockup_and_wait(
            product_id=product_id,
            variant_ids=variant_ids,
            image_url=image_url,
        )

        if not mockups:
            return None

        # Find a mockup URL from the result
        mockup_url = None
        for m in mockups:
            mockup_url = m.get("mockup_url") or m.get("url")
            if mockup_url:
                break

        if not mockup_url:
            logger.warning(f"No mockup URL in Printful response for {slug}")
            return None

        # Download the mockup image
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(mockup_url)
            resp.raise_for_status()
            return resp.content

    except Exception as e:
        logger.warning(f"Printful mockup failed for {slug}: {e}")
        return None


async def _pillow_mockup(slug: str, type: str) -> StreamingResponse:
    """Generate photorealistic mockup using Pillow compositing."""
    from PIL import ImageChops

    template_config = MOCKUP_TEMPLATES.get(type)
    if not template_config:
        raise HTTPException(status_code=400, detail=f"Unknown product type: {type}")

    image_path = await design_service.get_design_image_path(slug)
    if not image_path or not Path(image_path).exists():
        raise HTTPException(status_code=404, detail="Design image not found")

    # Load template from frontend/public/mockups/ or /app/mockups/ (Docker mount)
    template_dir = Path(__file__).resolve().parents[3] / "frontend" / "public" / "mockups"
    template_path = template_dir / template_config["template"]
    if not template_path.exists():
        template_path = Path("/app/mockups") / template_config["template"]
    if not template_path.exists():
        raise HTTPException(status_code=404, detail="Mockup template not found")

    # Load images
    template_img = Image.open(str(template_path)).convert("RGB")
    design_img = Image.open(image_path).convert("RGBA")

    # Start with the photorealistic template as the base
    canvas = template_img.copy()

    # Scale design to fit bounding box while maintaining aspect ratio
    bx, by, bw, bh = template_config["design_box"]
    scale = min(bw / design_img.width, bh / design_img.height)
    dw = int(design_img.width * scale)
    dh = int(design_img.height * scale)
    dx = bx + (bw - dw) // 2
    dy = by + (bh - dh) // 2

    design_resized = design_img.resize((dw, dh), Image.LANCZOS)

    blend_mode = template_config.get("blend", "paste")

    if blend_mode == "screen":
        # Screen blend for light designs on dark fabric.
        # We use a brightness-based mask so only non-dark pixels from
        # the design show through, preventing a visible dark rectangle
        # when the design has its own dark background.
        design_rgb = design_resized.convert("RGB")

        # Extract the region under the design
        region = canvas.crop((dx, dy, dx + dw, dy + dh))

        # Screen blend the design onto the fabric region
        blended = ImageChops.screen(region, design_rgb)

        # Create a luminance mask from the design — only bright pixels blend in.
        # This prevents the design's dark background from creating a visible box.
        lum = design_rgb.convert("L")
        # Boost contrast so only clearly visible parts of the design show
        lum = lum.point(lambda p: min(255, int(p * 1.5)))

        # Composite: use luminance as mask (bright pixels = show blended, dark = keep original)
        result = Image.composite(blended, region, lum)
        canvas.paste(result, (dx, dy))
    else:
        # Direct paste — for stickers/prints where design goes on a light surface
        if design_resized.mode == "RGBA":
            canvas.paste(design_resized, (dx, dy), design_resized)
        else:
            canvas.paste(design_resized, (dx, dy))

    # Export to high-quality PNG
    buf = io.BytesIO()
    canvas.save(buf, format="PNG", optimize=True)
    png_bytes = buf.getvalue()

    # Cache the result
    cache_key = (slug, type)
    _mockup_cache[cache_key] = png_bytes

    return StreamingResponse(
        io.BytesIO(png_bytes),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )
