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

export default async function HomePage() {
  const cookieStore = await cookies();
  const spaceId = cookieStore.get("space_id")?.value || "default";
  const [products, space] = await Promise.all([
    getProducts(spaceId),
    getSpaceConfig(spaceId),
  ]);

  const name = space?.name || "rSwag";
  const description =
    space?.description ||
    "Merch for the rSpace ecosystem. Stickers, shirts, and more — designed by the community, printed on demand.";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {name}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {description}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/design"
            className="inline-flex items-center justify-center rounded-md border border-primary px-8 py-3 text-lg font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Design Your Own
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-md border border-primary px-8 py-3 text-lg font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Upload Your Own
          </Link>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-2xl font-bold text-center mb-4">Featured Products</h2>
        <p className="text-center text-muted-foreground mb-12">
          Print-on-demand — fulfilled by Printful, shipped worldwide.
        </p>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No products available yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={`${API_URL}/designs/${product.slug}/mockup?type=${
                        product.product_type.includes("shirt") || product.product_type.includes("tee") ? "shirt"
                        : product.product_type.includes("sticker") ? "sticker"
                        : product.product_type.includes("print") ? "print"
                        : "shirt"
                      }`}
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
                      <span className="text-xl font-bold">${product.base_price.toFixed(2)}</span>
                      <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
