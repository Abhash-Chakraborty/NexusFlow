"use client";

import type { LucideIcon } from "lucide-react";

export function EmptyState({
  description,
  Icon,
  title,
}: {
  description: string;
  Icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border-default bg-surface-2/40 px-4 py-6 text-center">
      <div className="rounded-full border border-border-default bg-surface-0 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Icon className="h-5 w-5 text-text-secondary" />
      </div>
      <p className="mt-3 text-sm font-semibold tracking-[-0.02em] text-text-primary">{title}</p>
      <p className="mt-1 max-w-xs text-sm leading-5 text-text-secondary">{description}</p>
    </div>
  );
}
