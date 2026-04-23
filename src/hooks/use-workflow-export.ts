"use client";

import { downloadJson } from "@lib/utils";
import { importedWorkflowFileSchema } from "@lib/workflow-schemas";

import { useWorkflowStore } from "./use-workflow-store";

export function useWorkflowExport() {
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);
  const workflowDescription = useWorkflowStore((state) => state.workflowDescription);
  const workflowName = useWorkflowStore((state) => state.workflowName);
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow);

  const exportWorkflow = () => {
    const payload = {
      name: workflowName,
      description: workflowDescription,
      graph: {
        nodes,
        edges,
      },
    };

    downloadJson(
      `${workflowName.toLowerCase().replace(/\s+/g, "-") || "nexusflow-workflow"}.json`,
      payload,
    );
  };

  const importWorkflow = async (file: File) => {
    const text = await file.text();
    const raw = JSON.parse(text) as unknown;
    const parsed = importedWorkflowFileSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error("Imported JSON does not match the NexusFlow workflow schema.");
    }

    loadWorkflow({
      id: null,
      name: parsed.data.name,
      description: parsed.data.description,
      graph: parsed.data.graph,
      version: 1,
    });

    return parsed.data;
  };

  return {
    exportWorkflow,
    importWorkflow,
  };
}
