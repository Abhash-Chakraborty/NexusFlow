"use client";

import { type ConnectionLineComponentProps, getSmoothStepPath } from "@xyflow/react";

export function ConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) {
  const [path] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="var(--color-accent)"
        strokeDasharray="6 6"
        strokeWidth={2}
        style={{ animation: "pulse-line 1.2s ease-in-out infinite" }}
      />
    </g>
  );
}
