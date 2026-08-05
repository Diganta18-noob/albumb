import type { Metadata, Viewport } from "next";
import { Fraunces, Newsreader, JetBrains_Mono, Caveat } from "next/font/google";
import { ThemeProvider, themeScript } from "@/components/providers/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GrainOverlay } from "@/components/chrome/GrainOverlay";
import { FilmSpine } from "@/components/chrome/FilmSpine";
import { TopBar } from "@/components/chrome/TopBar";
import { SITE_TITLE } from "@/lib/data";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_TITLE} — Every Moment Has A Story`,
    template: `%s — ${SITE_TITLE}`,
  },
  description:
    "From strangers to lifelong memories. A photographic record of one training cohort, November 2025 to March 2026.",
  openGraph: {
    title: `${SITE_TITLE} — Every Moment Has A Story`,
    description: "From strangers to lifelong memories.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0E13" },
    { media: "(prefers-color-scheme: light)", color: "#F2EFE9" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${newsreader.variable} ${jetbrains.variable} ${caveat.variable}`}
    >
      <head>
        {/* Applies the stored theme before first paint — no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScroll>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:px-4 focus:py-2"
              style={{ background: "var(--surface-raised)", color: "var(--text)" }}
            >
              Skip to content
            </a>
            <GrainOverlay />
            <FilmSpine />
            <TopBar />
            <main id="main" className="md:pl-[72px]">
              {children}
            </main>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
