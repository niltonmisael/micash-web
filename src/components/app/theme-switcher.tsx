"use client";

import { IconDeviceDesktop, IconMoon, IconSun, type Icon } from "@tabler/icons-react";
import clsx from "clsx";
import { useTheme, type ThemeChoice } from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; icon: Icon }[] = [
  { value: "system", label: "Sistema", icon: IconDeviceDesktop },
  { value: "light", label: "Claro", icon: IconSun },
  { value: "dark", label: "Escuro", icon: IconMoon },
];

/** Sistema / Claro / Escuro. `compact` shows icons only (sidebar); otherwise icon + label (settings). */
export function ThemeSwitcher({ compact }: { compact?: boolean }) {
  const { choice, setChoice } = useTheme();
  return (
    <div role="radiogroup" aria-label="Tema" className="bg-brand-50 flex gap-1 rounded-2xl p-1">
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
              "flex flex-1 items-center justify-center gap-2 rounded-xl transition-colors",
              compact ? "py-2" : "px-4 py-2.5 text-lg font-semibold",
              active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            <OptionIcon size={compact ? "1.2rem" : "1.3rem"} aria-hidden />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}
