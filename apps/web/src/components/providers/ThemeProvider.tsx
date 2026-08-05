"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "sepia" | "auto";

const THEMES: Theme[] = ["dark", "light", "sepia", "auto"];
const STORAGE_KEY = "chronicles-theme";

interface ThemeContextValue {
  theme: Theme;
  resolved: Exclude<Theme, "auto">;
  setTheme: (t: Theme) => void;
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): Exclude<Theme, "auto"> {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<Exclude<Theme, "auto">>("dark");

  // Read the stored preference after mount. The inline script in layout.tsx
  // has already applied it to <html>, so there is no flash — this only syncs
  // React state with what the DOM is already showing.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && THEMES.includes(stored)) setThemeState(stored);
  }, []);

  useEffect(() => {
    const apply = () => {
      const next = theme === "auto" ? systemTheme() : theme;
      setResolved(next);
      document.documentElement.dataset.theme = next;
    };
    apply();

    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const cycle = useCallback(() => {
    setThemeState((prev) => {
      const next = THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length] ?? "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>.");
  return ctx;
}

/**
 * Runs before paint to prevent a theme flash. Kept as a string so it can go
 * into a <script> tag in the server-rendered document head.
 */
export const themeScript = `
(function(){
  try {
    var t = localStorage.getItem("${STORAGE_KEY}") || "dark";
    if (t === "auto") {
      t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`.trim();
