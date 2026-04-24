"use client";

import { cn } from "@lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium tracking-[-0.02em] shadow-sm transition duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-[2px] focus-visible:outline-dashed focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2",
  {
    variants: {
      size: {
        icon: "h-9 w-9",
        md: "h-10 px-4",
        sm: "h-9 px-3.5",
      },
      variant: {
        ghost:
          "border-transparent bg-transparent text-text-secondary shadow-none hover:bg-[var(--color-accent-subtle)] hover:text-text-primary",
        outline:
          "border-border-default bg-surface-0 text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur hover:bg-surface-2",
        primary:
          "border-[var(--color-accent)] bg-[var(--color-accent)] text-text-inverse shadow-[0_10px_26px_rgba(0,0,0,0.14)] hover:bg-[var(--color-accent-hover)]",
        subtle:
          "border-transparent bg-[var(--color-accent-subtle)] text-text-primary shadow-none backdrop-blur hover:bg-[var(--color-accent-glow)]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "outline",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
