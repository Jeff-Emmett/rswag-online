import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import { cookies } from "next/headers";
import "./globals.css";
import type { SpaceConfig } from "@/lib/spaces";
import { themeToCSS } from "@/lib/spaces";
import { HeaderBar } from "@/components/HeaderBar";

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
          <HeaderBar name={name} logoUrl={logoUrl ?? null} />

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
