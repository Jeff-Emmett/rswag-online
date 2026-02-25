"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSpaceIdFromCookie, getCartKey } from "@/lib/spaces";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ProductVariant {
  name: string;
  sku: string;
  provider: string;
  price: number;
}

interface Product {
  slug: string;
  name: string;
  description: string;
  category: string;
  product_type: string;
  tags: string[];
  image_url: string;
  base_price: number;
  variants: ProductVariant[];
  is_active: boolean;
}

const MOCKUP_TYPES = [
  { type: "shirt", label: "T-Shirt", icon: "👕" },
  { type: "sticker", label: "Sticker", icon: "🏷️" },
  { type: "print", label: "Art Print", icon: "🖼️" },
];

function getMockupType(productType: string): string {
  if (productType.includes("shirt") || productType.includes("tee") || productType.includes("hoodie")) return "shirt";
  if (productType.includes("sticker")) return "sticker";
  if (productType.includes("print")) return "print";
  return "shirt";
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<string>("shirt");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${API_URL}/products/${slug}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Product not found" : "Failed to load product");
          return;
        }
        const data = await res.json();
        setProduct(data);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        setSelectedMockup(getMockupType(data.product_type));
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  const getOrCreateCart = async (): Promise<string | null> => {
    let cartId = localStorage.getItem(getCartKey(getSpaceIdFromCookie()));
    if (cartId) {
      try {
        const res = await fetch(`${API_URL}/cart/${cartId}`);
        if (res.ok) return cartId;
      } catch { /* cart expired */ }
    }
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        cartId = data.id;
        localStorage.setItem(getCartKey(getSpaceIdFromCookie()), cartId!);
        return cartId;
      }
    } catch { return null; }
    return null;
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    setAddingToCart(true);
    try {
      const cartId = await getOrCreateCart();
      if (!cartId) { alert("Failed to create cart"); return; }

      const res = await fetch(`${API_URL}/cart/${cartId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_slug: product.slug,
          variant_sku: selectedVariant.sku,
          quantity,
        }),
      });

      if (res.ok) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to add to cart");
      }
    } catch { alert("Failed to add to cart"); }
    finally { setAddingToCart(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="aspect-square rounded-xl bg-muted animate-pulse" />
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-20 w-full bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              <div className="h-12 w-full bg-muted rounded animate-pulse mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Product not found"}</h1>
          <Link href="/products" className="text-primary hover:underline">Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm flex items-center gap-2">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <span className="text-muted-foreground/50">/</span>
          <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image Section */}
          <div className="space-y-4">
            {/* Main mockup image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border shadow-sm">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-muted-foreground">Loading mockup...</span>
                  </div>
                </div>
              )}
              <img
                src={`${API_URL}/designs/${product.slug}/mockup?type=${selectedMockup}`}
                alt={`${product.name} — ${selectedMockup} mockup`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>

            {/* Mockup type switcher */}
            <div className="flex gap-2">
              {MOCKUP_TYPES.map((mt) => (
                <button
                  key={mt.type}
                  onClick={() => {
                    setSelectedMockup(mt.type);
                    setImageLoading(true);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    selectedMockup === mt.type
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="mr-1.5">{mt.icon}</span>
                  {mt.label}
                </button>
              ))}
            </div>

            {/* Raw design preview */}
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Original Design</p>
              <div className="aspect-video rounded-md overflow-hidden bg-muted">
                <img
                  src={`${API_URL}/designs/${product.slug}/image`}
                  alt={`${product.name} — raw design`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                {product.category} — {product.product_type}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            <div className="text-4xl font-bold mb-8">
              ${selectedVariant?.price.toFixed(2) || product.base_price.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-2">+ shipping</span>
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 1 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.sku}
                      onClick={() => setSelectedVariant(variant)}
                      className={`min-w-[3.5rem] px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedVariant?.sku === variant.sku
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {variant.name.replace(/ \(printful\)$/i, "")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">Quantity</label>
              <div className="inline-flex items-center rounded-lg border overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="w-14 h-12 flex items-center justify-center font-semibold border-x text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                addedToCart
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {addingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding to cart...
                </span>
              ) : addedToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart!
                </span>
              ) : (
                `Add to Cart — $${((selectedVariant?.price || product.base_price) * quantity).toFixed(2)}`
              )}
            </button>

            {addedToCart && (
              <Link
                href="/cart"
                className="block text-center mt-4 py-3 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition-colors"
              >
                View Cart →
              </Link>
            )}

            {/* Product info */}
            <div className="mt-10 space-y-4 text-sm text-muted-foreground border-t pt-8">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Printed and shipped by Printful. Fulfilled on demand — no waste.</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Standard shipping: 5–12 business days. Express available at checkout.</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Bella + Canvas 3001 — premium 100% combed cotton, retail fit.</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-muted rounded-full text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
