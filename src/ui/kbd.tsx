"use client";

import { cn } from "@lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-6 items-center justify-center rounded-[10px] border border-border-default bg-white/90 px-2 py-1 font-mono text-[11px] text-text-secondary shadow-sm backdrop-blur",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
