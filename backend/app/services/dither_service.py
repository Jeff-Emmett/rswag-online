"""Dithering service — palette building, dithering, and color separations."""

import hashlib
import io
import logging
from collections import OrderedDict

import numpy as np
from PIL import Image

import hitherdither

from app.schemas.dither import DitherAlgorithm, PaletteMode

logger = logging.getLogger(__name__)

# Max dimension for dithering input — keeps processing under Cloudflare timeout
_MAX_DITHER_DIM = 512

# In-memory cache: sha256(slug+params) → (png_bytes, metadata)
_MAX_CACHE = 200
_dither_cache: OrderedDict[str, tuple[bytes, dict]] = OrderedDict()

# Screen-print separation cache: sha256(slug+params) → {color_hex: png_bytes, "composite": png_bytes}
_separation_cache: OrderedDict[str, tuple[bytes, dict[str, bytes], list[str]]] = OrderedDict()


def _cache_key(*parts) -> str:
    raw = "|".join(str(p) for p in parts)
    return hashlib.sha256(raw.encode()).hexdigest()


def _evict(cache: OrderedDict, max_size: int = _MAX_CACHE):
    while len(cache) > max_size:
        cache.popitem(last=False)


def _downscale(image: Image.Image, max_dim: int = _MAX_DITHER_DIM) -> Image.Image:
    """Downscale image if either dimension exceeds max_dim."""
    if image.width <= max_dim and image.height <= max_dim:
        return image
    scale = max_dim / max(image.width, image.height)
    new_size = (int(image.width * scale), int(image.height * scale))
    return image.resize(new_size, Image.LANCZOS)


def _hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"{r:02X}{g:02X}{b:02X}"


def build_palette(
    image: Image.Image,
    mode: PaletteMode,
    num_colors: int = 8,
    custom_colors: list[str] | None = None,
) -> hitherdither.palette.Palette:
    """Build a hitherdither Palette from an image and mode."""
    if mode == PaletteMode.CUSTOM and custom_colors:
        rgb_colors = [_hex_to_rgb(c) for c in custom_colors]
        return hitherdither.palette.Palette(rgb_colors)

    if mode == PaletteMode.GRAYSCALE:
        step = 255 // max(num_colors - 1, 1)
        grays = [(i * step, i * step, i * step) for i in range(num_colors)]
        return hitherdither.palette.Palette(grays)

    if mode == PaletteMode.SPOT and custom_colors:
        rgb_colors = [_hex_to_rgb(c) for c in custom_colors[:num_colors]]
        return hitherdither.palette.Palette(rgb_colors)

    # Auto mode: median-cut quantization
    quantized = image.convert("RGB").quantize(colors=num_colors, method=Image.Quantize.MEDIANCUT)
    palette_data = quantized.getpalette()
    colors = []
    for i in range(num_colors):
        idx = i * 3
        if idx + 2 < len(palette_data):
            colors.append((palette_data[idx], palette_data[idx + 1], palette_data[idx + 2]))
    if not colors:
        colors = [(0, 0, 0), (255, 255, 255)]
    return hitherdither.palette.Palette(colors)


def _get_palette_hex(palette: hitherdither.palette.Palette) -> list[str]:
    """Extract hex color strings from a palette."""
    colors = []
    for color in palette.colours:
        r, g, b = int(color[0]), int(color[1]), int(color[2])
        colors.append(_rgb_to_hex(r, g, b))
    return colors


# Map algorithm enum to hitherdither function calls
_ERROR_DIFFUSION_ALGOS = {
    DitherAlgorithm.FLOYD_STEINBERG: "floyd-steinberg",
    DitherAlgorithm.ATKINSON: "atkinson",
    DitherAlgorithm.STUCKI: "stucki",
    DitherAlgorithm.BURKES: "burkes",
    DitherAlgorithm.SIERRA: "sierra3",
    DitherAlgorithm.SIERRA_TWO_ROW: "sierra2",
    DitherAlgorithm.SIERRA_LITE: "sierra-2-4a",
    DitherAlgorithm.JARVIS_JUDICE_NINKE: "jarvis-judice-ninke",
}


def apply_dither(
    image: Image.Image,
    palette: hitherdither.palette.Palette,
    algorithm: DitherAlgorithm,
    threshold: int = 64,
    order: int = 8,
) -> Image.Image:
    """Apply a dithering algorithm to an image with the given palette."""
    img_rgb = image.convert("RGB")

    if algorithm in _ERROR_DIFFUSION_ALGOS:
        method = _ERROR_DIFFUSION_ALGOS[algorithm]
        result = hitherdither.diffusion.error_diffusion_dithering(
            img_rgb, palette, method=method, order=2,
        )
    elif algorithm == DitherAlgorithm.ORDERED:
        result = hitherdither.ordered.bayer.bayer_dithering(
            img_rgb, palette, [threshold, threshold, threshold], order=order,
        )
    elif algorithm == DitherAlgorithm.BAYER:
        result = hitherdither.ordered.bayer.bayer_dithering(
            img_rgb, palette, [threshold, threshold, threshold], order=order,
        )
    elif algorithm == DitherAlgorithm.YLILUOMA:
        result = hitherdither.ordered.yliluoma.yliluomas_1_ordered_dithering(
            img_rgb, palette, order=order,
        )
    elif algorithm == DitherAlgorithm.CLUSTER_DOT:
        result = hitherdither.ordered.cluster.cluster_dot_dithering(
            img_rgb, palette, [threshold, threshold, threshold], order=order,
        )
    else:
        # Fallback to Floyd-Steinberg
        result = hitherdither.diffusion.error_diffusion_dithering(
            img_rgb, palette, method="floyd-steinberg", order=2,
        )

    # hitherdither returns a PIL Image (indexed); convert to RGB
    if hasattr(result, "convert"):
        return result.convert("RGB")
    return result


def dither_design(
    image_path: str,
    slug: str,
    algorithm: DitherAlgorithm = DitherAlgorithm.FLOYD_STEINBERG,
    palette_mode: PaletteMode = PaletteMode.AUTO,
    num_colors: int = 8,
    custom_colors: list[str] | None = None,
    threshold: int = 64,
    order: int = 8,
    fresh: bool = False,
) -> tuple[bytes, dict]:
    """Dither a design image and return (png_bytes, metadata).

    Results are cached by slug+params combination.
    """
    key = _cache_key(slug, algorithm.value, palette_mode.value, num_colors,
                     ",".join(custom_colors or []), threshold, order)

    if not fresh and key in _dither_cache:
        _dither_cache.move_to_end(key)
        png_bytes, meta = _dither_cache[key]
        meta["cached"] = True
        return png_bytes, meta

    image = _downscale(Image.open(image_path))
    palette = build_palette(image, palette_mode, num_colors, custom_colors)
    dithered = apply_dither(image, palette, algorithm, threshold, order)

    buf = io.BytesIO()
    dithered.save(buf, format="PNG", optimize=True)
    png_bytes = buf.getvalue()

    colors_used = _get_palette_hex(palette)

    meta = {
        "slug": slug,
        "algorithm": algorithm.value,
        "palette_mode": palette_mode.value,
        "num_colors": len(colors_used),
        "colors_used": colors_used,
        "cached": False,
    }

    _dither_cache[key] = (png_bytes, meta)
    _evict(_dither_cache)

    return png_bytes, meta


def generate_color_separations(
    image_path: str,
    slug: str,
    num_colors: int = 4,
    algorithm: DitherAlgorithm = DitherAlgorithm.FLOYD_STEINBERG,
    spot_colors: list[str] | None = None,
) -> tuple[bytes, dict[str, bytes], list[str]]:
    """Generate color separations for screen printing.

    Returns (composite_png_bytes, {hex_color: separation_png_bytes}, colors_list).
    """
    palette_mode = PaletteMode.SPOT if spot_colors else PaletteMode.AUTO
    key = _cache_key("sep", slug, num_colors, algorithm.value,
                     ",".join(spot_colors or []))

    if key in _separation_cache:
        _separation_cache.move_to_end(key)
        return _separation_cache[key]

    image = _downscale(Image.open(image_path))
    palette = build_palette(image, palette_mode, num_colors, spot_colors)
    dithered = apply_dither(image, palette, algorithm)

    # Save composite
    buf = io.BytesIO()
    dithered.save(buf, format="PNG", optimize=True)
    composite_bytes = buf.getvalue()

    # Generate per-color separations
    dithered_rgb = dithered.convert("RGB")
    arr = np.array(dithered_rgb)
    colors = _get_palette_hex(palette)
    separations: dict[str, bytes] = {}

    for hex_color in colors:
        r, g, b = _hex_to_rgb(hex_color)
        # Create mask where pixels match this color (with small tolerance)
        mask = (
            (np.abs(arr[:, :, 0].astype(int) - r) < 16) &
            (np.abs(arr[:, :, 1].astype(int) - g) < 16) &
            (np.abs(arr[:, :, 2].astype(int) - b) < 16)
        )

        # White background, color pixels where mask is true
        sep_img = np.full_like(arr, 255)
        sep_img[mask] = [r, g, b]

        sep_pil = Image.fromarray(sep_img.astype(np.uint8))
        buf = io.BytesIO()
        sep_pil.save(buf, format="PNG", optimize=True)
        separations[hex_color] = buf.getvalue()

    result = (composite_bytes, separations, colors)
    _separation_cache[key] = result
    _evict(_separation_cache)

    return result
