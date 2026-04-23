"use client";

import type { NodeTypeConfig } from "@constants/node-config";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import { cn } from "@lib/utils";
import type { NodeType, ValidationIssue } from "@types-app/workflow.types";
import { Badge } from "@ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Handle, Position } from "@xyflow/react";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { memo } from "react";

interface BaseNodeProps {
  children?: React.ReactNode;
  config: NodeTypeConfig;
  id: string;
  label: string;
  nodeType: NodeType;
  outputLabels?: string[] | undefined;
  selected: boolean;
  showInputHandle?: boolean | undefined;
  showOutputHandle?: boolean | undefined;
  subtitle?: string | undefined;
  validationIssues?: ValidationIssue[] | undefined;
}

export const BaseNode = memo(function BaseNode({
  children,
  config,
  id,
  label,
  outputLabels = config.outputLabels,
  selected,
  showInputHandle = true,
  showOutputHandle = true,
  subtitle,
  validationIssues = [],
}: BaseNodeProps) {
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const errorCount = validationIssues.filter((issue) => issue.severity === "error").length;
  const warningCount = validationIssues.filter((issue) => issue.severity === "warning").length;
  const hasValidationIssues = errorCount > 0 || warningCount > 0;
  const Icon = config.icon;

  return (
    <div
      className="relative w-[240px] overflow-visible rounded-[14px]"
      data-node-id={id}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        boxShadow: selected ? "var(--shadow-node-selected)" : "var(--shadow-node)",
      }}
    >
      {showInputHandle ? (
        <>
          {/* biome-ignore lint/correctness/useUniqueElementIds: React Flow handle ids are scoped per node. */}
          <Handle
            id="in"
            position={Position.Top}
            type="target"
            style={{
              background: "#fff",
              borderColor: config.colorHex,
              left: "50%",
            }}
          />
        </>
      ) : null}

      <div className="px-[1px] pt-[1px]">
        <div className="h-[4px] rounded-t-[11px]" style={{ backgroundColor: config.colorHex }} />
      </div>

      <div className="flex items-start justify-between gap-3 px-3 pb-2 pt-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="rounded-full p-2"
              style={{
                backgroundColor: "#fff",
                color: config.colorHex,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{label}</p>
              {subtitle ? (
                <p className="mt-0.5 truncate text-[11px] text-text-secondary">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="nodrag nopan rounded-full p-1.5 text-text-muted transition hover:bg-white/80 hover:text-text-primary"
              onClick={(event) => {
                event.stopPropagation();
                selectNode(id);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="nodrag nopan w-44 p-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-sm text-text-primary transition hover:bg-surface-2"
              onClick={(event) => {
                event.stopPropagation();
                selectNode(id);
              }}
            >
              <SquarePen className="h-4 w-4" />
              Edit node
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-sm text-[var(--color-error)] transition hover:bg-[var(--color-error-bg)]"
              onClick={(event) => {
                event.stopPropagation();
                removeNode(id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete node
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <div
        className={cn("border-t border-white/60 px-3 pt-2", hasValidationIssues ? "pb-11" : "pb-3")}
      >
        {children}
      </div>

      {hasValidationIssues ? (
        <div className="absolute bottom-3 left-3 flex gap-1">
          {errorCount > 0 ? (
            <Badge tone="error" title={`${errorCount} error(s)`}>
              {errorCount} error
            </Badge>
          ) : null}
          {warningCount > 0 ? (
            <Badge tone="warning" title={`${warningCount} warning(s)`}>
              {warningCount} warning
            </Badge>
          ) : null}
        </div>
      ) : null}

      {showOutputHandle ? (
        config.outputHandles === 2 ? (
          <>
            {/* biome-ignore lint/correctness/useUniqueElementIds: React Flow handle ids are scoped per node. */}
            <Handle
              id="approved"
              position={Position.Bottom}
              type="source"
              style={{ background: "#fff", borderColor: config.colorHex, left: "35%" }}
            />
            {/* biome-ignore lint/correctness/useUniqueElementIds: React Flow handle ids are scoped per node. */}
            <Handle
              id="rejected"
              position={Position.Bottom}
              type="source"
              style={{ background: "#fff", borderColor: config.colorHex, left: "65%" }}
            />
            <div className="pointer-events-none absolute -bottom-7 left-0 right-0 flex justify-between px-10">
              {(outputLabels ?? ["Approved", "Rejected"]).map((outputLabel) => (
                <span
                  key={outputLabel}
                  className={cn(
                    "rounded-full bg-white px-2 py-1 text-[10px] font-medium text-text-secondary shadow-sm",
                  )}
                >
                  {outputLabel}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* biome-ignore lint/correctness/useUniqueElementIds: React Flow handle ids are scoped per node. */}
            <Handle
              id="out"
              position={Position.Bottom}
              type="source"
              style={{
                background: "#fff",
                borderColor: config.colorHex,
                left: "50%",
              }}
            />
          </>
        )
      ) : null}
    </div>
  );
});
