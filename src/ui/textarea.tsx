"use client";

import { cn } from "@lib/utils";
import * as React from "react";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[96px] w-full rounded-[20px] border border-border-default bg-surface-0 px-4 py-3 text-sm tracking-[-0.02em] text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition placeholder:text-text-muted focus:border-[var(--color-border-focus)] focus-visible:outline-[2px] focus-visible:outline-dashed focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
