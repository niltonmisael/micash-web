"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Theme: "system" (default) follows the OS; "light"/"dark" are the user's choice, kept in this browser
 * (localStorage) and applied as <html data-theme>. globals.css holds the colors of each theme.
 */
export type ThemeChoice = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "micash-theme";
const CHANGE_EVENT = "micash-theme-change";

/** Inline in <head>: applies the saved choice before the first paint (no flash of the wrong theme). */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function readChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function systemDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage blocked (private mode): the choice still applies to this page.
  }
  if (choice === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);
  const dark = useSyncExternalStore(subscribe, systemDark, () => false);
  const resolved: ResolvedTheme = choice === "system" ? (dark ? "dark" : "light") : choice;
  const setChoice = useCallback((next: ThemeChoice) => setThemeChoice(next), []);
  return { choice, resolved, setChoice };
}

/** Reads a --mc-* color for libraries that need a plain value (Recharts SVG attributes ignore var()). */
export function cssColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
