"use client";

import { useState, useCallback } from "react";

interface FlowSplits {
  printer: number;
  creator: number;
  community: number;
}

const DEFAULT_SALE_PRICE = 29.99;
const DEFAULT_PRODUCTION_COST = 9.25;

// Min production cost as fraction of price (Printful cost floor)
const MIN_PRINTER_FRACTION = 0.15;

export function RevenueFlowSankey() {
  const [salePrice] = useState(DEFAULT_SALE_PRICE);
  const [splits, setSplits] = useState<FlowSplits>(() => {
    const printer = DEFAULT_PRODUCTION_COST / DEFAULT_SALE_PRICE;
    const remaining = 1 - printer;
    return {
      printer,
      creator: remaining * 0.35,
      community: remaining * 0.65,
    };
  });

  const handleSplitChange = useCallback(
    (key: keyof FlowSplits, newValue: number) => {
      setSplits((prev) => {
        const updated = { ...prev, [key]: newValue };

        // Enforce minimum printer cost
        if (updated.printer < MIN_PRINTER_FRACTION) {
          updated.printer = MIN_PRINTER_FRACTION;
        }

        // Normalize so all splits sum to 1
        const total = updated.printer + updated.creator + updated.community;
        if (total === 0) return prev;

        return {
          printer: updated.printer / total,
          creator: updated.creator / total,
          community: updated.community / total,
        };
      });
    },
    []
  );

  const printerAmount = salePrice * splits.printer;
  const creatorAmount = salePrice * splits.creator;
  const communityAmount = salePrice * splits.community;

  return (
    <div className="space-y-8">
      {/* SVG Sankey Diagram */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox="0 0 700 320"
          className="w-full h-auto max-w-2xl mx-auto"
          role="img"
          aria-label="Revenue flow diagram showing how sale price splits between printer, creator, and community"
        >
          <defs>
            <linearGradient id="flowPrinter" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="flowCreator" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="flowCommunity" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
            </linearGradient>
            {/* Glow filters */}
            <filter id="glowGreen">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Source node: Sale ── */}
          <rect
            x="30"
            y="110"
            width="90"
            height="100"
            rx="8"
            className="fill-primary/20 stroke-primary"
            strokeWidth="2"
          />
          <text
            x="75"
            y="150"
            textAnchor="middle"
            className="fill-foreground text-sm font-bold"
            style={{ fontSize: "14px" }}
          >
            Sale
          </text>
          <text
            x="75"
            y="175"
            textAnchor="middle"
            className="fill-primary"
            style={{ fontSize: "18px", fontWeight: 700 }}
          >
            ${salePrice.toFixed(2)}
          </text>

          {/* ── Flow paths (Bezier curves) ── */}
          <SankeyFlow
            startX={120}
            startY={135}
            endX={480}
            endY={60}
            width={splits.printer * 80 + 4}
            gradient="url(#flowPrinter)"
          />
          <SankeyFlow
            startX={120}
            startY={160}
            endX={480}
            endY={160}
            width={splits.creator * 80 + 4}
            gradient="url(#flowCreator)"
          />
          <SankeyFlow
            startX={120}
            startY={185}
            endX={480}
            endY={260}
            width={splits.community * 80 + 4}
            gradient="url(#flowCommunity)"
          />

          {/* ── Target nodes ── */}
          {/* Printer */}
          <rect x="480" y="25" width="190" height="70" rx="8" fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="505" cy="50" r="10" fill="#3b82f6" />
          <text x="503" y="54" textAnchor="middle" fill="white" style={{ fontSize: "11px" }}>P</text>
          <text x="525" y="50" className="fill-foreground" style={{ fontSize: "13px", fontWeight: 600 }} dominantBaseline="middle">
            Printer
          </text>
          <text x="525" y="72" fill="#3b82f6" style={{ fontSize: "16px", fontWeight: 700 }}>
            ${printerAmount.toFixed(2)}
          </text>
          <text x="605" y="72" className="fill-muted-foreground" style={{ fontSize: "11px" }}>
            ({(splits.printer * 100).toFixed(0)}%)
          </text>

          {/* Creator */}
          <rect x="480" y="125" width="190" height="70" rx="8" fill="#a855f720" stroke="#a855f7" strokeWidth="1.5" />
          <circle cx="505" cy="150" r="10" fill="#a855f7" />
          <text x="503" y="154" textAnchor="middle" fill="white" style={{ fontSize: "11px" }}>C</text>
          <text x="525" y="150" className="fill-foreground" style={{ fontSize: "13px", fontWeight: 600 }} dominantBaseline="middle">
            Creator
          </text>
          <text x="525" y="172" fill="#a855f7" style={{ fontSize: "16px", fontWeight: 700 }}>
            ${creatorAmount.toFixed(2)}
          </text>
          <text x="605" y="172" className="fill-muted-foreground" style={{ fontSize: "11px" }}>
            ({(splits.creator * 100).toFixed(0)}%)
          </text>

          {/* Community */}
          <rect x="480" y="225" width="190" height="70" rx="8" fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="505" cy="250" r="10" fill="#10b981" filter="url(#glowGreen)" />
          <text x="503" y="254" textAnchor="middle" fill="white" style={{ fontSize: "11px" }}>$</text>
          <text x="525" y="250" className="fill-foreground" style={{ fontSize: "13px", fontWeight: 600 }} dominantBaseline="middle">
            Community
          </text>
          <text x="525" y="272" fill="#10b981" style={{ fontSize: "16px", fontWeight: 700 }}>
            ${communityAmount.toFixed(2)}
          </text>
          <text x="612" y="272" className="fill-muted-foreground" style={{ fontSize: "11px" }}>
            ({(splits.community * 100).toFixed(0)}%)
          </text>
        </svg>
      </div>

      {/* ── Interactive Sliders ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <FlowSlider
          label="Printer"
          sublabel="Production"
          value={splits.printer}
          amount={printerAmount}
          color="#3b82f6"
          onChange={(v) => handleSplitChange("printer", v)}
        />
        <FlowSlider
          label="Creator"
          sublabel="Design Margin"
          value={splits.creator}
          amount={creatorAmount}
          color="#a855f7"
          onChange={(v) => handleSplitChange("creator", v)}
        />
        <FlowSlider
          label="Community"
          sublabel="Revenue Fund"
          value={splits.community}
          amount={communityAmount}
          color="#10b981"
          onChange={(v) => handleSplitChange("community", v)}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground max-w-lg mx-auto">
        Drag the sliders to see how revenue flows between production, creator, and
        community. The community sets its own margin — every dollar above production
        cost funds collective work.
      </p>
    </div>
  );
}

/* ── Bezier flow path ── */
function SankeyFlow({
  startX,
  startY,
  endX,
  endY,
  width,
  gradient,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  gradient: string;
}) {
  const midX = (startX + endX) / 2;
  const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  return (
    <path
      d={d}
      stroke={gradient}
      strokeWidth={Math.max(width, 2)}
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
      style={{ transition: "stroke-width 0.3s ease, d 0.3s ease" }}
    />
  );
}

/* ── Slider for a single flow channel ── */
function FlowSlider({
  label,
  sublabel,
  value,
  amount,
  color,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  amount: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm font-semibold" style={{ color }}>
            {label}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {sublabel}
          </span>
        </div>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          ${amount.toFixed(2)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${value * 100}%, hsl(var(--muted)) ${value * 100}%)`,
          accentColor: color,
        }}
        aria-label={`${label} share: ${(value * 100).toFixed(0)}%`}
      />

      <div className="text-center text-xs font-medium text-muted-foreground tabular-nums">
        {(value * 100).toFixed(0)}%
      </div>
    </div>
  );
}
