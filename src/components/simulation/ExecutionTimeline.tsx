"use client";

import type { SimulationStep } from "@types-app/api.types";
import { Badge } from "@ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, SkipForward, XCircle } from "lucide-react";

const statusIconMap = {
  failed: XCircle,
  pending: Loader2,
  running: Loader2,
  skipped: SkipForward,
  success: CheckCircle2,
} as const;

const statusToneMap = {
  failed: "error",
  pending: "muted",
  running: "accent",
  skipped: "muted",
  success: "success",
} as const;

export function ExecutionTimeline({ steps }: { steps: SimulationStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const Icon = statusIconMap[step.status];
        return (
          <motion.div
            key={step.nodeId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="grid grid-cols-[24px_1fr] gap-3"
          >
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-surface-0 p-1 shadow-sm">
                <Icon
                  className={`h-4 w-4 ${step.status === "running" || step.status === "pending" ? "animate-spin" : ""}`}
                />
              </div>
              {index < steps.length - 1 ? (
                <div className="mt-2 h-full w-px bg-border-default" />
              ) : null}
            </div>
            <div className="rounded-[16px] border border-border-default bg-surface-0 p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                <Badge tone={statusToneMap[step.status]}>{step.status}</Badge>
                <Badge tone="muted">{step.nodeType}</Badge>
                <Badge tone="accent">{step.durationMs} ms</Badge>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{step.message}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
