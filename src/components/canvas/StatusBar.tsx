"use client";

import { useTheme } from "@components/providers/ThemeProvider";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import { Badge } from "@ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Tooltip } from "@ui/tooltip";
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Link2,
  MoonStar,
  Save,
  SunMedium,
} from "lucide-react";

export function StatusBar() {
  const edges = useWorkflowStore((state) => state.edges);
  const isDirty = useWorkflowStore((state) => state.isDirty);
  const isSaved = useWorkflowStore((state) => state.isSaved);
  const isSaving = useWorkflowStore((state) => state.isSaving);
  const nodes = useWorkflowStore((state) => state.nodes);
  const validationResult = useWorkflowStore((state) => state.validationResult);
  const { setTheme, theme } = useTheme();

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
    <div
      className="surface-card grid min-h-[42px] gap-2.5 rounded-[24px] px-3 py-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center"
      data-tour-id="graph-status"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-text-secondary">
        <Select value={theme} onValueChange={(value) => setTheme(value as "dark" | "light")}>
          <SelectTrigger className="h-8 min-w-[128px] gap-2 px-3 text-xs shadow-none">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <MoonStar className="h-3.5 w-3.5" />
              ) : (
                <SunMedium className="h-3.5 w-3.5" />
              )}
              <SelectValue placeholder="Theme" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>

        <span className="mono-label">Graph status</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-0 px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CircleDot className="h-3.5 w-3.5" />
          {nodes.length} nodes
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-0 px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Link2 className="h-3.5 w-3.5" />
          {edges.length} links
        </span>
        {validationSummary ? (
          <Tooltip content={<div className="max-w-[320px] space-y-1.5">{validationSummary}</div>}>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-0 px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorCount} errors, {warningCount} warnings
            </span>
          </Tooltip>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-0 px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorCount} errors, {warningCount} warnings
          </span>
        )}
      </div>

      <div className="text-center text-[12px] font-medium text-text-secondary">
        Copyright © 2026 Abhash Chakraborty
      </div>

      <div className="flex items-center justify-start gap-2 lg:justify-end">
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
