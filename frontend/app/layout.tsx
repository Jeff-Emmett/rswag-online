import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import { cookies } from "next/headers";
import "./globals.css";
import type { SpaceConfig } from "@/lib/spaces";
import { themeToCSS } from "@/lib/spaces";
import { HeaderBar } from "@/components/HeaderBar";
import { EcosystemFooter } from "@/components/EcosystemFooter";

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
    icons: {
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👕</text></svg>",
    },
  };
}


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
          <EcosystemFooter current="rSwag" />
        </div>
      </body>
    </html>
  );
}
