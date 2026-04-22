import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from "@types-app/workflow.types";
import { ValidationCodes } from "@types-app/workflow.types";
import { describe, expect, it } from "vitest";

import { validateWorkflowGraph } from "./workflow-validator";

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

function buildBaseGraph(): WorkflowGraph {
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
        position: { x: 0, y: 150 },
        data: {
          nodeType: "taskNode",
          label: "Task",
          description: "",
          assignee: "Owner",
          dueDate: "2026-04-24",
          priority: "medium",
          customFields: [],
        },
      }),
      node({
        id: "end",
        type: "endNode",
        position: { x: 0, y: 300 },
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

describe("validateWorkflowGraph", () => {
  it("accepts a valid simple graph", () => {
    const result = validateWorkflowGraph(buildBaseGraph());

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("flags a graph with no start node", () => {
    const graph = buildBaseGraph();
    graph.nodes = graph.nodes.filter((entry) => entry.id !== "start");

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.MISSING_START)).toBe(true);
  });

  it("flags a graph with multiple start nodes", () => {
    const graph = buildBaseGraph();
    graph.nodes.push(
      node({
        id: "start-2",
        type: "startNode",
        position: { x: 100, y: 0 },
        data: { nodeType: "startNode", label: "Another Start", metadata: [] },
      }),
    );

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(
      result.issues.filter((issue) => issue.code === ValidationCodes.MULTIPLE_STARTS),
    ).toHaveLength(2);
  });

  it("flags a graph with no end node", () => {
    const graph = buildBaseGraph();
    graph.nodes = graph.nodes.filter((entry) => entry.id !== "end");

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.MISSING_END)).toBe(true);
  });

  it("flags an orphaned node", () => {
    const graph = buildBaseGraph();
    graph.nodes.push(
      node({
        id: "orphan",
        type: "taskNode",
        position: { x: 300, y: 300 },
        data: {
          nodeType: "taskNode",
          label: "Orphan",
          description: "",
          assignee: "Owner",
          dueDate: "",
          priority: "low",
          customFields: [],
        },
      }),
    );

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.DISCONNECTED_GRAPH)).toBe(
      true,
    );
  });

  it("flags cycles", () => {
    const graph = buildBaseGraph();
    graph.edges.push(edge("task", "start"));

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.CYCLE_DETECTED)).toBe(true);
  });

  it("flags a start node with incoming edges", () => {
    const graph = buildBaseGraph();
    graph.edges.push(edge("end", "start"));

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.START_HAS_INCOMING)).toBe(
      true,
    );
  });

  it("flags an end node with outgoing edges", () => {
    const graph = buildBaseGraph();
    graph.edges.push(edge("end", "task"));

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.END_HAS_OUTGOING)).toBe(
      true,
    );
  });

  it("flags automated steps with no action selected", () => {
    const graph = buildBaseGraph();
    graph.nodes[1] = node({
      id: "auto",
      type: "automatedStepNode",
      position: { x: 0, y: 150 },
      data: {
        nodeType: "automatedStepNode",
        label: "Automation",
        actionId: "",
        actionParams: {},
      },
    });
    graph.edges = [edge("start", "auto"), edge("auto", "end")];

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.MISSING_ACTION)).toBe(true);
  });

  it("returns a warning for empty labels", () => {
    const graph = buildBaseGraph();
    graph.nodes[0] = node({
      id: "start",
      type: "startNode",
      position: { x: 0, y: 0 },
      data: { nodeType: "startNode", label: "", metadata: [] },
    });

    const result = validateWorkflowGraph(graph);
    expect(result.isValid).toBe(true);
    expect(result.issues.some((issue) => issue.code === ValidationCodes.EMPTY_LABEL)).toBe(true);
    expect(result.issues.some((issue) => issue.severity === "error")).toBe(false);
  });
});
