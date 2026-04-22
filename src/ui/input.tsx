"use client";

import { cn } from "@lib/utils";
import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-full border border-border-default bg-white px-4 text-sm tracking-[-0.02em] text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none backdrop-blur transition placeholder:text-text-muted focus:border-[var(--color-border-focus)] focus-visible:outline-[2px] focus-visible:outline-dashed focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
