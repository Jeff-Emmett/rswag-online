"""Pydantic schemas for dithering API."""

from enum import Enum

from pydantic import BaseModel, Field


class DitherAlgorithm(str, Enum):
    """Supported dithering algorithms."""

    FLOYD_STEINBERG = "floyd-steinberg"
    ATKINSON = "atkinson"
    STUCKI = "stucki"
    BURKES = "burkes"
    SIERRA = "sierra"
    SIERRA_TWO_ROW = "sierra-two-row"
    SIERRA_LITE = "sierra-lite"
    JARVIS_JUDICE_NINKE = "jarvis-judice-ninke"
    BAYER = "bayer"
    YLILUOMA = "yliluoma"
    ORDERED = "ordered"
    CLUSTER_DOT = "cluster-dot"


class PaletteMode(str, Enum):
    """Palette generation modes."""

    AUTO = "auto"
    GRAYSCALE = "grayscale"
    SPOT = "spot"
    CUSTOM = "custom"


class DitherResponse(BaseModel):
    """Metadata response for dithered image."""

    slug: str
    algorithm: DitherAlgorithm
    palette_mode: PaletteMode
    num_colors: int
    colors_used: list[str] = Field(description="Hex color codes used in the palette")
    cached: bool
    image_url: str


class ScreenPrintRequest(BaseModel):
    """Request body for screen print color separation."""

    num_colors: int = Field(default=4, ge=2, le=12)
    algorithm: DitherAlgorithm = DitherAlgorithm.FLOYD_STEINBERG
    spot_colors: list[str] | None = Field(
        default=None,
        description="Optional list of hex colors to use as spot colors (e.g. ['FF0000', '00FF00'])",
    )


class ScreenPrintExport(BaseModel):
    """Response for screen print color separation."""

    slug: str
    num_colors: int
    algorithm: DitherAlgorithm
    colors: list[str] = Field(description="Hex color codes for each separation channel")
    composite_url: str
    separation_urls: dict[str, str] = Field(
        description="Map of hex color to separation image URL",
    )
