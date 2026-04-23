"use client";

import { cn } from "@lib/utils";

export function FormField({
  children,
  description,
  error,
  label,
  required = false,
}: {
  children: React.ReactNode;
  description?: string | undefined;
  error?: string | undefined;
  label: string;
  required?: boolean | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-semibold text-text-primary">
        {label}
        {required ? <span className="ml-1 text-[var(--color-error)]">*</span> : null}
      </div>
      {description ? <p className="text-xs text-text-secondary">{description}</p> : null}
      {children}
      {error ? <p className={cn("text-xs text-[var(--color-error)]")}>{error}</p> : null}
    </div>
  );
}
