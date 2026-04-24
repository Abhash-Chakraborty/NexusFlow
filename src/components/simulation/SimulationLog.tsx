"use client";

import type { SimulationStep } from "@types-app/api.types";

export function SimulationLog({ steps }: { steps: SimulationStep[] }) {
  return (
    <div className="rounded-[18px] border border-border-default bg-[var(--color-tooltip-bg)] p-4 font-mono text-xs text-[var(--color-tooltip-text)]">
      {steps.map((step) => (
        <p key={step.nodeId}>
          [{step.timestamp}] {step.label}: {step.message}
        </p>
      ))}
    </div>
  );
}
