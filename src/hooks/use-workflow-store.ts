"use client";

import { useWorkflowStore as useStore } from "@store/workflow.store";
import type { ValidationIssue } from "@types-app/workflow.types";
import { useMemo } from "react";

export { useStore as useWorkflowStore };

const EMPTY_VALIDATION_ISSUES: ValidationIssue[] = [];

export function useSelectedNode() {
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const nodes = useStore((state) => state.nodes);

  return useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
}

export function useWorkflowGraph() {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);

  return useMemo(() => ({ nodes, edges }), [edges, nodes]);
}

export function useNodeValidationIssues(nodeId: string) {
  return useStore(
    (state) => state.validationResult.issuesByNode[nodeId] ?? EMPTY_VALIDATION_ISSUES,
  );
}
