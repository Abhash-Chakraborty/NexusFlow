"use client";

import type { SimulationStep } from "@types-app/api.types";

export function SimulationLog({ steps }: { steps: SimulationStep[] }) {
  return (
    <div className="rounded-[18px] border border-border-default bg-[#132033] p-4 font-mono text-xs text-white">
      {steps.map((step) => (
        <p key={step.nodeId}>
          [{step.timestamp}] {step.label}: {step.message}
        </p>
      ))}
    </div>
  );
}
