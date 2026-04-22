import { getAutomationAction } from "@constants/automation-actions";
import { validateWorkflowGraph } from "@lib/workflow-validator";
import type { SimulateResponse, SimulationStep, StepStatus } from "@types-app/api.types";
import type { WorkflowGraph } from "@types-app/workflow.types";
import { nanoid } from "nanoid";

const BASE_DURATIONS: Record<string, number> = {
  approvalNode: 1800,
  automatedStepNode: 900,
  endNode: 150,
  startNode: 120,
  taskNode: 480,
};

function topologicalSort(graph: WorkflowGraph) {
  const inDegree = new Map(graph.nodes.map((node) => [node.id, 0]));
  const adjacency = new Map(graph.nodes.map((node) => [node.id, [] as string[]]));

  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const orderedIds = graph.nodes
    .filter((node) => (inDegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const result: string[] = [];

  while (orderedIds.length > 0) {
    const current = orderedIds.shift();
    if (!current) {
      continue;
    }

    result.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const nextDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, nextDegree);
      if (nextDegree === 0) {
        orderedIds.push(neighbor);
      }
    }
  }

  return result.length === graph.nodes.length ? result : graph.nodes.map((node) => node.id);
}

function getStepStatus(node: WorkflowGraph["nodes"][number]): StepStatus {
  const hasLabel = typeof node.data.label === "string" && node.data.label.trim().length > 0;
  if (!hasLabel) {
    return "failed";
  }

  switch (node.data.nodeType) {
    case "taskNode":
      return node.data.assignee.trim() ? "success" : "failed";
    case "approvalNode":
      return node.data.approverRole ? "success" : "failed";
    case "automatedStepNode":
      return node.data.actionId.trim() ? "success" : "failed";
    default:
      return "success";
  }
}

function getStepMessage(node: WorkflowGraph["nodes"][number], status: StepStatus) {
  if (node.data.nodeType === "automatedStepNode") {
    const action = getAutomationAction(node.data.actionId);
    return status === "success"
      ? `Executed ${action?.label ?? node.data.actionId} with mock runtime output.`
      : "Automation step is missing a selected action.";
  }

  if (node.data.nodeType === "taskNode") {
    return status === "success"
      ? `Assigned to ${node.data.assignee} and queued for completion.`
      : "Task is missing an assignee, so it failed validation during simulation.";
  }

  if (node.data.nodeType === "approvalNode") {
    return `Routed to ${node.data.approverRole} with ${node.data.autoApproveThreshold}% auto-approval threshold.`;
  }

  if (node.data.nodeType === "endNode") {
    return node.data.endMessage;
  }

  return "Workflow execution started.";
}

export async function simulateWorkflow(graph: WorkflowGraph): Promise<SimulateResponse> {
  const validation = validateWorkflowGraph(graph);
  const orderedNodeIds = topologicalSort(graph);
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  const steps: SimulationStep[] = orderedNodeIds.map((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found while simulating`);
    }

    const status = getStepStatus(node);
    const durationMs = BASE_DURATIONS[node.type] ?? 300;

    return {
      stepIndex: index,
      nodeId: node.id,
      nodeType: node.type,
      label: node.data.label,
      status,
      message: getStepMessage(node, status),
      durationMs,
      timestamp: new Date(Date.now() + index * 250).toISOString(),
      metadata:
        node.data.nodeType === "automatedStepNode"
          ? { actionId: node.data.actionId }
          : node.data.nodeType === "taskNode"
            ? { assignee: node.data.assignee }
            : undefined,
    };
  });

  const totalDurationMs = steps.reduce((sum, step) => sum + step.durationMs, 0);
  const failedSteps = steps.filter((step) => step.status === "failed");

  return {
    executionId: nanoid(16),
    success: validation.isValid && failedSteps.length === 0,
    steps,
    summary:
      failedSteps.length === 0
        ? `Workflow executed across ${steps.length} steps in ${(totalDurationMs / 1000).toFixed(2)}s.`
        : `Workflow failed at ${failedSteps.length} step(s): ${failedSteps.map((step) => step.label).join(", ")}.`,
    totalDurationMs,
    validationIssues: validation.issues,
  };
}
