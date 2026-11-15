import { IconAlertCircle, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shadow-card bg-surface rounded-[var(--radius-card)]", className)} {...props} />;
}

const ALERT = {
  error: { icon: IconAlertCircle, className: "bg-expense-soft text-expense" },
  success: { icon: IconCircleCheck, className: "bg-income-soft text-income" },
  info: { icon: IconInfoCircle, className: "bg-brand-50 text-ink" },
};

export function Alert({
  tone = "error",
  children,
}: {
  tone?: keyof typeof ALERT;
  children: React.ReactNode;
}) {
  const { icon: Icon, className } = ALERT[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl px-4 py-3 text-[0.95rem]", className)}
    >
      <Icon size="1.25rem" className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  barClassName = "bg-brand-500",
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("bg-brand-50 h-2 overflow-hidden rounded-full", className)}
    >
      <div className={cn("h-full rounded-full", barClassName)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-brand-50 animate-pulse rounded-xl", className)} />;
}
