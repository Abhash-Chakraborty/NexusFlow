"use client";

import { cn } from "@lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
  {
    variants: {
      tone: {
        accent: "bg-[var(--color-accent)] text-white",
        error: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
        muted: "bg-black/6 text-text-secondary",
        success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
