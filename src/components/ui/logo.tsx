import { IconChartBar } from "@tabler/icons-react";
import clsx from "clsx";

export function Logo({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  const large = size === "lg";
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <span
        className={clsx(
          "bg-brand-500 grid place-items-center rounded-xl text-white",
          large ? "size-14 rounded-2xl" : "size-12",
        )}
      >
        <IconChartBar size={large ? "1.875rem" : "1.625rem"} stroke={2} />
      </span>
      <span className={clsx("text-ink font-bold tracking-tight", large ? "text-3xl" : "text-[1.7rem]")}>
        MiCash
      </span>
    </span>
  );
}
