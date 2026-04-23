"use client";

import { applyAutoLayout } from "@lib/auto-layout";
import { useCallback, useState } from "react";

import { useWorkflowStore } from "./use-workflow-store";

export function useAutoLayout() {
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);
  const replaceGraph = useWorkflowStore((state) => state.replaceGraph);
  const [direction, setDirection] = useState<"LR" | "TB">("TB");

  const applyLayout = useCallback(
    (nextDirection: "LR" | "TB") => {
      setDirection(nextDirection);
      replaceGraph(
        {
          nodes: applyAutoLayout({ nodes, edges }, nextDirection),
          edges,
        },
        { recordHistory: true, markDirty: true, preserveSelection: true },
      );
    },
    [edges, nodes, replaceGraph],
  );

  return {
    applyLayout,
    direction,
  };
}
