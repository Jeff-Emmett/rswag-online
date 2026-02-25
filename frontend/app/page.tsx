import Link from "next/link";
import { cookies } from "next/headers";
import type { SpaceConfig } from "@/lib/spaces";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Product {
  slug: string;
  name: string;
  description: string;
  category: string;
  product_type: string;
  image_url: string;
  base_price: number;
}

async function getProducts(spaceId: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (spaceId && spaceId !== "default") {
      params.set("space", spaceId);
    }
    const url = `${API_URL}/products${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getSpaceConfig(spaceId: string): Promise<SpaceConfig | null> {
  try {
    const res = await fetch(`${API_URL}/spaces/${spaceId}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

function getMockupType(productType: string): string {
  if (
    productType.includes("shirt") ||
    productType.includes("tee") ||
    productType.includes("hoodie")
  )
    return "shirt";
  if (productType.includes("sticker")) return "sticker";
  if (productType.includes("print")) return "print";
  return "shirt";
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const spaceId = cookieStore.get("space_id")?.value || "default";
  const [products, space] = await Promise.all([
    getProducts(spaceId),
    getSpaceConfig(spaceId),
  ]);

  const name = space?.name || "rSwag";
  const isCustomSpace = spaceId !== "default" && !!space;

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative text-center py-16 sm:py-24 space-y-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4">
          <span className="inline-flex items-center rounded-full text-sm px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 font-medium">
            Part of the rSpace Ecosystem
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            {isCustomSpace ? (
              name
            ) : (
              <>
                Get Your Community{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">
                  Noticed
                </span>
                <br />
                with{" "}
                <span className="text-white">(you)</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-amber-300">
                  rMerch
                </span>
              </>
            )}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {isCustomSpace ? (
              space?.description ||
              "Custom merchandise for your community."
            ) : (
              <>
                A self-provisioned local design &amp; print protocol that
                generates{" "}
                <strong className="text-foreground">revenue</strong> (and
                attention!) for your community.
              </>
            )}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-3.5 text-lg font-medium text-primary-foreground transition-all shadow-lg shadow-primary/20"
            >
              Browse the Shop
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-lg border border-primary/30 hover:bg-primary/5 px-8 py-3.5 text-lg font-medium transition-colors"
            >
              Upload a Design
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center rounded-full text-sm px-4 py-1.5 bg-muted text-muted-foreground font-medium">
            How It Works
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            From Design to Revenue in Minutes
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            <strong className="text-primary">Create</strong> your community&apos;s
            merch, <strong className="text-secondary">sell</strong> it on demand,
            and <strong className="text-foreground">fund</strong> your
            community&apos;s work — no inventory, no risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg
                  className="h-5 w-5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg">1. Upload or Create a Design</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your own artwork or generate a unique design with our AI
              studio. Logos, slogans, art — anything that represents your
              community.
              <strong className="text-foreground block mt-2">
                Your community&apos;s identity, on merch.
              </strong>
            </p>
          </div>

          {/* Step 2 */}
          <div className="border-2 border-secondary/40 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <svg
                  className="h-5 w-5 text-secondary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg">2. Pick Products & Set Prices</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose from t-shirts, hoodies, stickers, posters, mugs, and more.
              Set your markup — every dollar above cost goes directly into your
              community&apos;s funding stream.
              <strong className="text-foreground block mt-2">
                You set the margin, you keep the revenue.
              </strong>
            </p>
          </div>

          {/* Step 3 */}
          <div className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shrink-0">
                <svg
                  className="h-5 w-5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438a2.253 2.253 0 01-1.699 2.608l-.425.108A9.012 9.012 0 013.888 15.9"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg">3. Ship Locally — Worldwide</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Printful prints locally from the nearest fulfillment center — less
              shipping, less carbon. Delivered to your community members anywhere
              in the world.
              <strong className="text-foreground block mt-2">
                Local production, global reach.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Community Revenue Model ───────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Merch That Funds Your Mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every purchase feeds revenue directly into your community&apos;s
              funding streams. No middlemen, no platform fees eating your margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Revenue Flow */}
            <div className="border border-primary/20 rounded-xl p-6 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">Direct Revenue Stream</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Set your own margins. Printful handles production at cost, and
                the markup goes straight into your community&apos;s treasury, DAO,
                or project fund.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Production cost</span>
                  <span>$9.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your price</span>
                  <span>$29.99</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-primary">
                  <span>Community revenue</span>
                  <span>$20.74 per sale</span>
                </div>
              </div>
            </div>

            {/* Community Benefits */}
            <div className="border border-primary/20 rounded-xl p-6 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">Built for Communities</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong className="text-foreground">Branded Spaces</strong> — each community gets their own storefront with custom theme, logo, and catalog</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong className="text-foreground">Zero inventory risk</strong> — items printed on demand, no upfront costs for your community</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong className="text-foreground">Revenue routing</strong> — connect to rFunds, DAOs, or any wallet to stream merch revenue directly into community funding</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong className="text-foreground">Local production</strong> — Printful fulfills from the nearest center, reducing shipping distance and carbon footprint</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Everything Your Community Needs
          </h2>
          <p className="text-muted-foreground">
            Tools to design, sell, and ship merch that funds your collective work
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-primary/20 hover:border-primary/40 transition-colors rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">AI Design Studio</h3>
            <p className="text-sm text-muted-foreground">
              Generate unique designs with AI or upload your own. Instant
              photorealistic product mockups.
            </p>
          </div>

          <div className="border border-primary/20 hover:border-primary/40 transition-colors rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Community Spaces</h3>
            <p className="text-sm text-muted-foreground">
              Each community gets its own branded storefront — custom domain,
              theme, and product catalog.
            </p>
          </div>

          <div className="border border-primary/20 hover:border-primary/40 transition-colors rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Revenue Streams</h3>
            <p className="text-sm text-muted-foreground">
              Merch revenue flows directly to your community — connect to rFunds,
              DAOs, treasuries, or any funding channel.
            </p>
          </div>

          <div className="border border-primary/20 hover:border-primary/40 transition-colors rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Realistic Mockups</h3>
            <p className="text-sm text-muted-foreground">
              See your design on real products via Printful&apos;s mockup engine
              before you ever commit to an order.
            </p>
          </div>

          <div className="border border-primary/20 hover:border-primary/40 transition-colors rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Local Fulfillment</h3>
            <p className="text-sm text-muted-foreground">
              Printed at the nearest Printful facility — shorter shipping
              distances, less carbon, faster delivery.
            </p>
          </div>

          <div className="border border-primary/20 hover:border-primary/40 transition-colors rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">rSpace Ecosystem</h3>
            <p className="text-sm text-muted-foreground">
              Part of the r* suite — integrates with rFunds for treasury, rVote
              for design governance, and more.
            </p>
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Community Merch
              </h2>
              <p className="text-muted-foreground">
                Locally produced, print-on-demand — every sale supports the
                community.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={`${API_URL}/designs/${product.slug}/mockup?type=${getMockupType(product.product_type)}`}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white capitalize">
                          {product.product_type}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold">
                          ${product.base_price.toFixed(2)}
                        </span>
                        <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center text-primary font-medium hover:underline"
                >
                  View all {products.length} products &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA Section ───────────────────────────────────────── */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="py-12 sm:py-16 text-center space-y-6 relative px-6">
            <span className="inline-flex items-center rounded-full text-sm px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 font-medium">
              Fund Your Community
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Turn your community&apos;s identity into a revenue stream
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Create a Space, upload your designs, and start selling merch that
              funds your community&apos;s work. Every sale flows directly into your
              community&apos;s funding channels.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8 py-3.5 text-lg font-medium text-primary-foreground transition-all"
              >
                Get Started
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg border border-primary/30 hover:bg-primary/5 px-8 py-3.5 text-lg font-medium transition-colors"
              >
                Browse the Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
