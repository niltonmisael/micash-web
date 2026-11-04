import { IconLoader2 } from "@tabler/icons-react";
import clsx from "clsx";
import { cn } from "@/lib/cn";
import Link from "next/link";

type Variant = "primary" | "outline" | "ghost" | "link";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-200",
  outline: "border border-line bg-surface text-ink hover:bg-brand-50",
  ghost: "text-muted hover:bg-brand-50 hover:text-ink",
  link: "text-brand-700 hover:text-brand-800 font-semibold",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed";

function sizeClass(variant: Variant, block?: boolean) {
  if (variant === "link") return "";
  return clsx("h-14 px-6 text-lg", block && "w-full");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  block,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], sizeClass(variant, block), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <IconLoader2 className="animate-spin" size="1.25rem" aria-hidden />}
      {children}
    </button>
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: Variant; block?: boolean };

export function ButtonLink({ variant = "primary", block, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(BASE, VARIANTS[variant], sizeClass(variant, block), className)} {...props} />;
}
