"use client";

import { useWorkflowStore } from "@hooks/use-workflow-store";
import { Badge } from "@ui/badge";
import { Tooltip } from "@ui/tooltip";
import { AlertCircle, CheckCircle2, CircleDot, Link2, Save } from "lucide-react";

export function StatusBar() {
  const edges = useWorkflowStore((state) => state.edges);
  const isDirty = useWorkflowStore((state) => state.isDirty);
  const isSaved = useWorkflowStore((state) => state.isSaved);
  const isSaving = useWorkflowStore((state) => state.isSaving);
  const nodes = useWorkflowStore((state) => state.nodes);
  const validationResult = useWorkflowStore((state) => state.validationResult);

  const errorCount = validationResult.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = validationResult.issues.filter(
    (issue) => issue.severity === "warning",
  ).length;
  const validationSummary = validationResult.issues.length
    ? validationResult.issues.map((issue, index) => (
        <div key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? index}`} className="flex gap-2">
          <span className="uppercase text-white/55">{issue.severity}</span>
          <span>{issue.message}</span>
        </div>
      ))
    : null;

  return (
    <div className="surface-card flex min-h-[42px] flex-wrap items-center justify-between gap-2.5 rounded-[24px] px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
        <span className="mono-label">Graph status</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CircleDot className="h-3.5 w-3.5" />
          {nodes.length} nodes
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Link2 className="h-3.5 w-3.5" />
          {edges.length} links
        </span>
        {validationSummary ? (
          <Tooltip content={<div className="max-w-[320px] space-y-1.5">{validationSummary}</div>}>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorCount} errors, {warningCount} warnings
            </span>
          </Tooltip>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorCount} errors, {warningCount} warnings
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <a
          className="hidden text-[11px] font-medium text-text-muted transition hover:text-text-primary xl:inline"
          href="https://nexusflow.abhashchakraborty.tech/designer"
          rel="noreferrer"
          target="_blank"
        >
          Copyright © 2026 Abhash Chakraborty
        </a>
        {validationResult.isValid && nodes.length > 0 ? (
          <Badge tone="success">Ready to run</Badge>
        ) : null}
        {isSaving ? <Badge tone="accent">Saving...</Badge> : null}
        {!isSaving && isSaved && !isDirty ? (
          <Badge tone="success">
            <CheckCircle2 className="h-3 w-3" />
            Saved
          </Badge>
        ) : null}
        {!isSaving && isDirty ? (
          <Badge tone="warning">
            <Save className="h-3 w-3" />
            Unsaved
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
