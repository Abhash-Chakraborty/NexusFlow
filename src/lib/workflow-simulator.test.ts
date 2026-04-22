import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from "@types-app/workflow.types";
import { describe, expect, it } from "vitest";

import { simulateWorkflow } from "./workflow-simulator";

function node(node: WorkflowNode): WorkflowNode {
  return node;
}

function edge(source: string, target: string): WorkflowEdge {
  return {
    id: `${source}-${target}`,
    type: "default",
    source,
    target,
    sourceHandle: null,
    targetHandle: null,
    animated: false,
    data: {},
  };
}

function linearGraph(overrides?: { assignee?: string | undefined }): WorkflowGraph {
  return {
    nodes: [
      node({
        id: "start",
        type: "startNode",
        position: { x: 0, y: 0 },
        data: { nodeType: "startNode", label: "Start", metadata: [] },
      }),
      node({
        id: "task",
        type: "taskNode",
        position: { x: 0, y: 100 },
        data: {
          nodeType: "taskNode",
          label: "Task",
          description: "A task",
          assignee: overrides?.assignee ?? "Owner",
          dueDate: "2026-04-24",
          priority: "medium",
          customFields: [],
        },
      }),
      node({
        id: "end",
        type: "endNode",
        position: { x: 0, y: 200 },
        data: {
          nodeType: "endNode",
          label: "End",
          endMessage: "Done",
          showSummary: true,
          outcomeType: "success",
        },
      }),
    ],
    edges: [edge("start", "task"), edge("task", "end")],
  };
}

describe("simulateWorkflow", () => {
  it("returns steps in topological order for a linear graph", async () => {
    const result = await simulateWorkflow(linearGraph());
    expect(result.steps.map((step) => step.nodeId)).toEqual(["start", "task", "end"]);
  });

  it("returns the correct number of steps", async () => {
    const result = await simulateWorkflow(linearGraph());
    expect(result.steps).toHaveLength(3);
  });

  it("marks steps as failed when required data is missing", async () => {
    const result = await simulateWorkflow(linearGraph({ assignee: "" }));
    expect(result.steps.find((step) => step.nodeId === "task")?.status).toBe("failed");
  });

  it("always returns a non-empty executionId", async () => {
    const result = await simulateWorkflow(linearGraph());
    expect(result.executionId.length).toBeGreaterThan(0);
  });

  it("reports a positive totalDurationMs", async () => {
    const result = await simulateWorkflow(linearGraph());
    expect(result.totalDurationMs).toBeGreaterThan(0);
  });
});
