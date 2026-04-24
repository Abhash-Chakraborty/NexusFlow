import { nodeDataSchema, workflowGraphSchema } from "@lib/workflow-schemas";
import type { NodeVersion, WorkflowGraph } from "@types-app/workflow.types";

interface ParseStoredGraphSuccess {
  graph: WorkflowGraph;
  ok: true;
}

interface ParseStoredGraphFailure {
  error: string;
  ok: false;
}

export function parseStoredWorkflowGraph(
  raw: string,
): ParseStoredGraphSuccess | ParseStoredGraphFailure {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return {
      ok: false,
      error: "Stored workflow graph contains invalid JSON.",
    };
  }

  const result = workflowGraphSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: "Stored workflow graph no longer matches the NexusFlow schema.",
    };
  }

  return {
    ok: true,
    graph: result.data as WorkflowGraph,
  };
}

export function parseStoredNodeVersionData(raw: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  const result = nodeDataSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

export function groupNodeVersions(
  rows: Array<{
    createdAt: string;
    dataJson: string;
    id: string;
    label: string;
    nodeId: string;
    nodeType: string;
    workflowId: string;
  }>,
) {
  const grouped: Record<string, NodeVersion[]> = {};

  for (const row of rows) {
    const data = parseStoredNodeVersionData(row.dataJson);
    if (!data) {
      continue;
    }

    const versions = grouped[row.nodeId] ?? [];
    versions.push({
      id: row.id,
      workflowId: row.workflowId,
      nodeId: row.nodeId,
      nodeType: data.nodeType,
      data,
      label: row.label,
      createdAt: row.createdAt,
    });
    grouped[row.nodeId] = versions;
  }

  return grouped;
}
