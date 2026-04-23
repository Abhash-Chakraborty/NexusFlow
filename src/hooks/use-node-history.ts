"use client";

import { useMemo } from "react";

import { useSelectedNode, useWorkflowStore } from "./use-workflow-store";

export function useNodeHistory() {
  const selectedNode = useSelectedNode();
  const nodeVersionHistory = useWorkflowStore((state) => state.nodeVersionHistory);
  const restoreNodeVersion = useWorkflowStore((state) => state.restoreNodeVersion);

  const versions = useMemo(
    () => (selectedNode ? (nodeVersionHistory[selectedNode.id] ?? []) : []),
    [nodeVersionHistory, selectedNode],
  );

  return {
    selectedNode,
    versions,
    restoreNodeVersion,
  };
}
