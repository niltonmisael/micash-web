import { IconLoader2 } from "@tabler/icons-react";
import clsx from "clsx";
import { cn } from "@/lib/cn";
import Link from "next/link";

type Variant = "primary" | "ink" | "outline" | "ghost" | "link";

const VARIANTS: Record<Variant, string> = {
  // Fixed hover shade: brand-700 turns light orange in dark mode, which would wash out the white label.
  primary:
    "bg-brand-600 text-white hover:bg-[#c75e16] disabled:bg-brand-200 shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)]",
  ink: "bg-ink text-cream hover:bg-ink/85 disabled:opacity-50",
  outline: "border border-line bg-surface text-ink hover:border-subtle hover:bg-brand-50",
  ghost: "text-muted hover:bg-brand-50 hover:text-ink",
  link: "text-brand-700 hover:text-brand-800 font-semibold",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0";

function sizeClass(variant: Variant, block?: boolean) {
  if (variant === "link") return "";
  return clsx("h-12 px-5 text-base", block && "w-full");
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
