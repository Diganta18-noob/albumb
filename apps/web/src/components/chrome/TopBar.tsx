"use client";

import Link from "next/link";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { SITE_TITLE } from "@/lib/data";

const LABEL: Record<Theme, string> = {
  dark: "DARKROOM",
  light: "DAYLIGHT",
  sepia: "ARCHIVE",
  auto: "AUTO",
};

/* `wide` links drop out before the pill runs out of room on tablets. */
const LINKS = [
  { href: "/timeline", label: "Timeline", wide: false },
  { href: "/wall", label: "The Wall", wide: false },
  { href: "/yearbook", label: "Yearbook", wide: false },
  { href: "/categories", label: "Categories", wide: true },
  { href: "/places", label: "Places", wide: true },
  { href: "/search", label: "Search", wide: false },
];

export function TopBar() {
  const { theme, cycle } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50 md:pl-[72px]">
      <div className="glass mx-3 mt-3 flex items-center justify-between gap-4 rounded-full px-4 py-2 md:mx-6 md:px-6">
        <Link href="/" className="group flex items-center gap-2.5 rounded-full">
          <span
            aria-hidden
            className="block size-2 rounded-full transition-transform duration-500 group-hover:scale-150"
            style={{ background: "var(--warm)" }}
          />
          <span
            className="font-display text-[0.95rem] tracking-tight"
            style={{ fontVariationSettings: '"SOFT" 30, "WONK" 1' }}
          >
            {SITE_TITLE}
          </span>
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-5 sm:flex lg:gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`mono-label rounded transition-colors hover:text-[var(--warm)] ${
                l.wide ? "hidden lg:inline" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={cycle}
          className="mono-label rounded-full border px-3 py-1.5 transition-colors hover:text-[var(--warm)]"
          style={{ borderColor: "var(--line)" }}
          aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
        >
          {LABEL[theme]}
        </button>
      </div>
    </header>
  );
}
