"use client";

import { IconDeviceDesktop, IconMoon, IconSun, type Icon } from "@tabler/icons-react";
import clsx from "clsx";
import { useTheme, type ThemeChoice } from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; icon: Icon }[] = [
  { value: "system", label: "Sistema", icon: IconDeviceDesktop },
  { value: "light", label: "Claro", icon: IconSun },
  { value: "dark", label: "Escuro", icon: IconMoon },
];

/**
 * Sistema / Claro / Escuro. `compact` shows icons only (sidebar); otherwise icon + label (settings).
 * `onRail` colors it for the graphite sidebar.
 */
export function ThemeSwitcher({ compact, onRail }: { compact?: boolean; onRail?: boolean }) {
  const { choice, setChoice } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={clsx("flex gap-1 rounded-xl p-1", onRail ? "bg-rail-raised" : "bg-brand-50")}
    >
      {OPTIONS.map(({ value, label, icon: OptionIcon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={compact ? `Tema ${label.toLowerCase()}` : undefined}
            title={compact ? `Tema: ${label}` : undefined}
            onClick={() => setChoice(value)}
            className={clsx(
              "flex flex-1 items-center justify-center gap-2 rounded-lg transition-colors",
              compact
                ? "py-1.5"
                : "flex-col px-2 py-2 text-sm font-semibold min-[420px]:flex-row min-[420px]:px-4 min-[420px]:text-base",
              onRail
                ? active
                  ? "bg-rail-line text-rail-ink"
                  : "text-rail-muted hover:text-rail-ink"
                : active
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
            )}
          >
            <OptionIcon size={compact ? "1.1rem" : "1.2rem"} aria-hidden />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}
