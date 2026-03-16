"""Dithering API endpoints for on-demand dithering and screen-print separations."""

import io
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.schemas.dither import (
    DitherAlgorithm,
    DitherResponse,
    PaletteMode,
    ScreenPrintExport,
    ScreenPrintRequest,
)
from app.services.design_service import DesignService
from app.services.dither_service import dither_design, generate_color_separations

logger = logging.getLogger(__name__)
router = APIRouter()
design_service = DesignService()


@router.get("/{slug}/dither")
async def get_dithered_design(
    slug: str,
    algorithm: DitherAlgorithm = DitherAlgorithm.FLOYD_STEINBERG,
    palette: PaletteMode = PaletteMode.AUTO,
    num_colors: int = Query(default=8, ge=2, le=32),
    colors: str | None = Query(default=None, description="Comma-separated hex colors for custom palette"),
    threshold: int = Query(default=64, ge=1, le=256),
    order: int = Query(default=8, ge=2, le=16),
    fresh: bool = False,
    format: str = Query(default="image", description="'image' for PNG, 'json' for metadata"),
):
    """Apply dithering to a design image.

    Returns a PNG image (default) or JSON metadata with image URL.
    """
    image_path = await design_service.get_design_image_path(slug)
    if not image_path or not Path(image_path).exists():
        raise HTTPException(status_code=404, detail="Design not found")

    custom_colors = [c.strip() for c in colors.split(",")] if colors else None

    try:
        png_bytes, meta = dither_design(
            image_path=image_path,
            slug=slug,
            algorithm=algorithm,
            palette_mode=palette,
            num_colors=num_colors,
            custom_colors=custom_colors,
            threshold=threshold,
            order=order,
            fresh=fresh,
        )
    except Exception as e:
        logger.error(f"Dithering failed for {slug}: {e}")
        raise HTTPException(status_code=500, detail=f"Dithering failed: {e}")

    if format == "json":
        return DitherResponse(
            slug=slug,
            algorithm=algorithm,
            palette_mode=palette,
            num_colors=meta["num_colors"],
            colors_used=meta["colors_used"],
            cached=meta["cached"],
            image_url=f"/api/designs/{slug}/dither?algorithm={algorithm.value}&palette={palette.value}&num_colors={num_colors}",
        )

    return StreamingResponse(
        io.BytesIO(png_bytes),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.post("/{slug}/screen-print", response_model=ScreenPrintExport)
async def create_screen_print(slug: str, body: ScreenPrintRequest):
    """Generate color separations for screen printing."""
    image_path = await design_service.get_design_image_path(slug)
    if not image_path or not Path(image_path).exists():
        raise HTTPException(status_code=404, detail="Design not found")

    try:
        composite_bytes, separations, colors = generate_color_separations(
            image_path=image_path,
            slug=slug,
            num_colors=body.num_colors,
            algorithm=body.algorithm,
            spot_colors=body.spot_colors,
        )
    except Exception as e:
        logger.error(f"Screen print generation failed for {slug}: {e}")
        raise HTTPException(status_code=500, detail=f"Screen print generation failed: {e}")

    base_url = f"/api/designs/{slug}/screen-print"
    separation_urls = {color: f"{base_url}/{color}" for color in colors}

    return ScreenPrintExport(
        slug=slug,
        num_colors=len(colors),
        algorithm=body.algorithm,
        colors=colors,
        composite_url=f"{base_url}/composite",
        separation_urls=separation_urls,
    )


@router.get("/{slug}/screen-print/{channel}")
async def get_screen_print_channel(slug: str, channel: str):
    """Serve a screen-print separation channel image.

    channel: "composite" or a hex color code (e.g. "FF0000")
    """
    image_path = await design_service.get_design_image_path(slug)
    if not image_path or not Path(image_path).exists():
        raise HTTPException(status_code=404, detail="Design not found")

    # Try to find cached separations — generate with defaults if not cached
    try:
        composite_bytes, separations, colors = generate_color_separations(
            image_path=image_path,
            slug=slug,
        )
    except Exception as e:
        logger.error(f"Screen print channel failed for {slug}/{channel}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate separation: {e}")

    if channel == "composite":
        png_bytes = composite_bytes
        filename = f"{slug}-composite.png"
    else:
        hex_upper = channel.upper().lstrip("#")
        if hex_upper not in separations:
            raise HTTPException(
                status_code=404,
                detail=f"Color channel '{channel}' not found. Available: {', '.join(separations.keys())}",
            )
        png_bytes = separations[hex_upper]
        filename = f"{slug}-{hex_upper}.png"

    return StreamingResponse(
        io.BytesIO(png_bytes),
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=86400",
            "Content-Disposition": f"attachment; filename={filename}",
        },
    )
