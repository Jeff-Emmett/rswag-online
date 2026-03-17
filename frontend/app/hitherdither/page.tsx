"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const ERROR_DIFFUSION = [
  { value: "floyd-steinberg", label: "Floyd-Steinberg" },
  { value: "atkinson", label: "Atkinson" },
  { value: "stucki", label: "Stucki" },
  { value: "burkes", label: "Burkes" },
  { value: "sierra", label: "Sierra" },
  { value: "sierra-two-row", label: "Sierra Two-Row" },
  { value: "sierra-lite", label: "Sierra Lite" },
  { value: "jarvis-judice-ninke", label: "Jarvis-Judice-Ninke" },
];

const ORDERED = [
  { value: "bayer", label: "Bayer" },
  { value: "ordered", label: "Ordered" },
  { value: "cluster-dot", label: "Cluster Dot" },
  { value: "yliluoma", label: "Yliluoma" },
];

const THRESHOLD_ALGORITHMS = ["bayer", "ordered", "cluster-dot"];
const ORDER_ALGORITHMS = ["bayer", "ordered", "cluster-dot", "yliluoma"];

interface Design {
  slug: string;
  name: string;
  image_url: string;
  status: string;
}

interface DitherResponse {
  slug: string;
  algorithm: string;
  palette_mode: string;
  num_colors: number;
  colors_used: string[];
  cached: boolean;
  image_url: string;
}

export default function HitherditherPage() {
  const searchParams = useSearchParams();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [slug, setSlug] = useState(searchParams.get("slug") || "");
  const [algorithm, setAlgorithm] = useState("floyd-steinberg");
  const [palette, setPalette] = useState("auto");
  const [numColors, setNumColors] = useState(8);
  const [threshold, setThreshold] = useState(64);
  const [order, setOrder] = useState(8);
  const [metadata, setMetadata] = useState<DitherResponse | null>(null);
  const [ditherUrl, setDitherUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch designs on mount
  useEffect(() => {
    fetch(`${API_URL}/designs?status=active`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: Design[]) => setDesigns(data))
      .catch(() => setError("Failed to load designs"));
  }, []);

  const showThreshold = THRESHOLD_ALGORITHMS.includes(algorithm);
  const showOrder = ORDER_ALGORITHMS.includes(algorithm);

  const buildDitherParams = () => {
    const params = new URLSearchParams({
      algorithm,
      palette,
      num_colors: String(numColors),
    });
    if (showThreshold) params.set("threshold", String(threshold));
    if (showOrder) params.set("order", String(order));
    return params;
  };

  const handleApply = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    try {
      const params = buildDitherParams();
      params.set("format", "json");
      const response = await fetch(
        `${API_URL}/designs/${slug}/dither?${params}`
      );

      if (!response.ok) {
        let message = "Dithering failed";
        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          const text = await response.text();
          message = text || `Server error (${response.status})`;
        }
        throw new Error(message);
      }

      const data: DitherResponse = await response.json();
      setMetadata(data);

      // Build image URL (without format=json)
      const imgParams = buildDitherParams();
      setDitherUrl(`${API_URL}/designs/${slug}/dither?${imgParams}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Hitherdither</h1>
        <p className="text-muted-foreground mb-8">
          Apply retro dithering effects to any design in the catalog
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Design Picker */}
            <div>
              <label
                htmlFor="design"
                className="block text-sm font-medium mb-2"
              >
                Design
              </label>
              <select
                id="design"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setMetadata(null);
                  setDitherUrl(null);
                }}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="">Select a design...</option>
                {designs.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm */}
            <div>
              <label
                htmlFor="algorithm"
                className="block text-sm font-medium mb-2"
              >
                Algorithm
              </label>
              <select
                id="algorithm"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <optgroup label="Error Diffusion">
                  {ERROR_DIFFUSION.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Ordered">
                  {ORDERED.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Palette */}
            <div>
              <label
                htmlFor="palette"
                className="block text-sm font-medium mb-2"
              >
                Palette
              </label>
              <select
                id="palette"
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="auto">Auto</option>
                <option value="grayscale">Grayscale</option>
                <option value="spot">Spot</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Number of Colors */}
            <div>
              <label
                htmlFor="numColors"
                className="block text-sm font-medium mb-2"
              >
                Colors: {numColors}
              </label>
              <input
                type="range"
                id="numColors"
                min={2}
                max={32}
                value={numColors}
                onChange={(e) => setNumColors(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>2</span>
                <span>32</span>
              </div>
            </div>

            {/* Threshold (conditional) */}
            {showThreshold && (
              <div>
                <label
                  htmlFor="threshold"
                  className="block text-sm font-medium mb-2"
                >
                  Threshold: {threshold}
                </label>
                <input
                  type="range"
                  id="threshold"
                  min={1}
                  max={256}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>256</span>
                </div>
              </div>
            )}

            {/* Order (conditional) */}
            {showOrder && (
              <div>
                <label
                  htmlFor="order"
                  className="block text-sm font-medium mb-2"
                >
                  Order: {order}
                </label>
                <input
                  type="range"
                  id="order"
                  min={2}
                  max={16}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2</span>
                  <span>16</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-red-400">
                {error}
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleApply}
              disabled={isLoading || !slug}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Dithering... this may take a moment
                </span>
              ) : (
                "Apply Dither"
              )}
            </button>
          </div>

          {/* Right: Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>

            {slug ? (
              <div className="space-y-4">
                {/* Side-by-side comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Original
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-muted/20 aspect-square">
                      <img
                        src={`${API_URL}/designs/${slug}/image`}
                        alt="Original design"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dithered
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-muted/20 aspect-square">
                      {ditherUrl ? (
                        <img
                          src={ditherUrl}
                          alt="Dithered result"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-muted-foreground px-4 text-center">
                            Click &ldquo;Apply Dither&rdquo; to see result
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Palette display */}
                {metadata && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {metadata.colors_used.map((color) => (
                        <div key={color} className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metadata.num_colors} colors
                      {metadata.cached ? " · cached" : ""}
                    </p>
                  </div>
                )}

                {/* Download */}
                {ditherUrl && (
                  <a
                    href={ditherUrl}
                    download={`${slug}-${algorithm}.png`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-muted-foreground/30 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download PNG
                  </a>
                )}
              </div>
            ) : (
              <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                <p className="text-muted-foreground text-center px-8">
                  Select a design to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              &bull; <strong>Error diffusion</strong> algorithms (Floyd-Steinberg,
              Atkinson, etc.) spread quantization error to neighboring pixels for
              natural-looking results
            </li>
            <li>
              &bull; <strong>Ordered</strong> algorithms (Bayer, Cluster Dot) use
              fixed threshold patterns for a more structured, retro look
            </li>
            <li>
              &bull; Fewer colors produce more dramatic dithering effects — try 2-4
              colors for a classic screen-print aesthetic
            </li>
            <li>
              &bull; First-time dithering for a design may take 5-12 seconds;
              subsequent requests with the same settings are cached
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
