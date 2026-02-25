import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";
import type { SpaceConfig } from "@/lib/spaces";
import { themeToCSS } from "@/lib/spaces";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getSpaceConfig(spaceId: string): Promise<SpaceConfig | null> {
  try {
    const res = await fetch(`${API_URL}/spaces/${spaceId}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const spaceId = cookieStore.get("space_id")?.value || "default";
  const space = await getSpaceConfig(spaceId);

  const name = space?.name || "rSwag";
  const tagline = space?.tagline || "Merch for the rSpace Ecosystem";
  return {
    title: `${name} — ${tagline}`,
    description: space?.description || "Design and order custom merchandise.",
  };
}

const ECOSYSTEM_LINKS = [
  { name: "rSpace", href: "https://rspace.online" },
  { name: "rSwag", href: "https://rswag.online", active: true },
  { name: "rWork", href: "https://rwork.online" },
  { name: "rMaps", href: "https://rmaps.online" },
  { name: "rNotes", href: "https://rnotes.online" },
  { name: "rVote", href: "https://rvote.online" },
  { name: "rFunds", href: "https://rfunds.online" },
  { name: "rTrips", href: "https://rtrips.online" },
  { name: "rCart", href: "https://rcart.online" },
  { name: "rWallet", href: "https://rwallet.online" },
  { name: "rFiles", href: "https://rfiles.online" },
  { name: "rTube", href: "https://rtube.online" },
  { name: "rCal", href: "https://rcal.online" },
  { name: "rNetwork", href: "https://rnetwork.online" },
  { name: "rInbox", href: "https://rinbox.online" },
  { name: "rStack", href: "https://rstack.online" },
  { name: "rAuctions", href: "https://rauctions.online" },
  { name: "rPubs", href: "https://rpubs.online" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const spaceId = cookieStore.get("space_id")?.value || "default";
  const space = await getSpaceConfig(spaceId);

  const name = space?.name || "rSwag";
  const logoUrl = space?.logo_url;
  const themeCSS = space?.theme ? themeToCSS(space.theme) : "";

  return (
    <html lang="en">
      <head>
        {themeCSS && (
          <style
            dangerouslySetInnerHTML={{
              __html: `:root {\n    ${themeCSS}\n  }`,
            }}
          />
        )}
      </head>
      <body className={GeistSans.className}>
        <div className="min-h-screen flex flex-col">
          {/* ── Sticky Nav ──────────────────────────────────── */}
          <header className="border-b sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-8 w-8 rounded" />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">
                    rS
                  </div>
                )}
                <span>
                  <span className="text-primary">r</span>
                  {name === "rSwag" ? "Swag" : name}
                </span>
              </Link>

              <nav className="flex items-center gap-1 sm:gap-4">
                <Link
                  href="/design"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 hidden sm:inline-flex"
                >
                  Design
                </Link>
                <Link
                  href="/upload"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  Upload
                </Link>
                <Link
                  href="/products"
                  className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Shop
                </Link>
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </Link>
              </nav>
            </div>
          </header>

          {/* ── Main Content ────────────────────────────────── */}
          <main className="flex-1">{children}</main>

          {/* ── Ecosystem Footer ────────────────────────────── */}
          <footer className="border-t py-8 mt-8">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground/70">
                  r* Ecosystem
                </span>
                {ECOSYSTEM_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`hover:text-foreground transition-colors ${
                      link.active
                        ? "font-medium text-primary"
                        : ""
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground/60">
                Part of the r* ecosystem — collaborative tools for communities.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
