"use client";

import { cn } from "@lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export function Select(props: SelectPrimitive.SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-full border border-border-default bg-white px-4 text-sm tracking-[-0.02em] text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition data-[placeholder]:text-text-muted focus-visible:outline-[2px] focus-visible:outline-dashed focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-text-secondary" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  children,
  className,
  position = "popper",
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "z-50 overflow-hidden rounded-[18px] border border-border-default bg-white shadow-[var(--shadow-menu)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ children, className, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-full py-2 pl-8 pr-3 text-sm text-text-primary outline-none transition focus:bg-surface-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export const SelectValue = SelectPrimitive.Value;
