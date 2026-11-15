import { IconChartBar } from "@tabler/icons-react";
import clsx from "clsx";

/**
 * The MiCash mark (orange tile + bar chart) and wordmark. `tone="light"` sets the wordmark for graphite
 * backgrounds (sidebar, hero, footer); the mark itself never changes.
 */
export function Logo({
  size = "md",
  tone = "ink",
  className,
}: {
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "light";
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span
        className={clsx(
          "bg-brand-500 grid place-items-center text-white",
          size === "lg"
            ? "size-12 rounded-xl"
            : size === "sm"
              ? "size-8 rounded-lg"
              : "size-10 rounded-[0.6rem]",
        )}
      >
        <IconChartBar
          size={size === "lg" ? "1.6rem" : size === "sm" ? "1.1rem" : "1.375rem"}
          stroke={2}
          aria-hidden
        />
      </span>
      <span
        className={clsx(
          "font-display font-bold tracking-[-0.03em]",
          tone === "light" ? "text-rail-ink" : "text-ink",
          size === "lg" ? "text-[1.9rem]" : size === "sm" ? "text-xl" : "text-[1.55rem]",
        )}
      >
        MiCash
      </span>
    </span>
  );
}
