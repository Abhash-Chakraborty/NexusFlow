"use client";

import { useWorkflowStore } from "@hooks/use-workflow-store";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { Trash2 } from "lucide-react";

export function CustomEdge({
  id,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const removeEdge = useWorkflowStore((state) => state.removeEdge);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "var(--color-accent)" : "var(--color-border-strong)",
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="group nodrag nopan nowheel pointer-events-all absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <button
            aria-label="Delete link"
            type="button"
            className={`nodrag nopan nowheel pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-surface-0 text-text-secondary shadow-[var(--shadow-menu)] transition hover:border-[var(--color-error)] hover:text-[var(--color-error)] ${
              selected ? "opacity-100" : "opacity-70 hover:opacity-100"
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              removeEdge(id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
