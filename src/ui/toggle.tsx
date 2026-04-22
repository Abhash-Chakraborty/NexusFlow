"use client";

import { cn } from "@lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export function Toggle(props: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border-default bg-surface-3 p-0.5 transition-colors data-[state=checked]:border-black data-[state=checked]:bg-[var(--color-accent)] focus-visible:outline-[2px] focus-visible:outline-dashed focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-6",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
