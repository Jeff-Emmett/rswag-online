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
                Community Merch,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  On Demand
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
                Create a{" "}
                <strong className="text-foreground">Space</strong> for your
                community&apos;s merchandise. Design, upload, and sell{" "}
                <strong className="text-foreground">print-on-demand</strong>{" "}
                swag — stickers, shirts, and more.
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
            rSwag in 30 Seconds
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            <strong className="text-primary">Upload</strong> your design,{" "}
            <strong className="text-secondary">preview</strong> it on products,
            and <strong className="text-foreground">order</strong> print-on-demand
            merch shipped worldwide.
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg">1. Upload a Design</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your own artwork or generate a unique design with AI.
              Transparent PNGs work best for clean product mockups.
              <strong className="text-foreground block mt-2">
                Your art, your merch.
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
              <h3 className="font-bold text-lg">2. Pick Products</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose from t-shirts, hoodies, stickers, posters, mugs, and more.
              See photorealistic mockups of your design on each product.
              <strong className="text-foreground block mt-2">
                Preview before you order.
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
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg">3. Ship Worldwide</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Printful prints and ships each order on demand. No inventory,
              no waste — just quality merch delivered to your door.
              <strong className="text-foreground block mt-2">
                Printed fresh, shipped fast.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Built for Communities
          </h2>
          <p className="text-muted-foreground">
            Everything you need to run a merch shop for your project or
            community
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
              Generate unique designs with AI or upload your own artwork.
              Instant photorealistic mockups.
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
              Each community gets its own branded storefront with custom themes,
              logos, and product catalog.
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
                  d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Zero Inventory</h3>
            <p className="text-sm text-muted-foreground">
              Print-on-demand means no upfront costs, no warehouse, no waste.
              Items are printed fresh per order.
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
              See your design on real product photos via Printful&apos;s mockup
              engine. No guessing how it&apos;ll look.
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
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              Pay with Mollie — credit card, iDEAL, PayPal, and more. European
              data residency for privacy.
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
                  d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438a2.253 2.253 0 01-1.699 2.608l-.425.108A9.012 9.012 0 013.888 15.9"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">rSpace Ecosystem</h3>
            <p className="text-sm text-muted-foreground">
              Part of the r* suite — integrates with rVote, rWork, rMaps, and
              more collaborative tools.
            </p>
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Print-on-demand — fulfilled by Printful, shipped worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
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
              Join the rSpace Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to launch your community&apos;s merch?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Create a Space for your project, upload your designs, and let your
              community order swag — all powered by print-on-demand.
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
                Browse the Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
