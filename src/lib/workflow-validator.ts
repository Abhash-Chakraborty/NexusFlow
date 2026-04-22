import { getNodeLabel } from "@lib/utils";
import type { ValidationIssue, ValidationResult, WorkflowGraph } from "@types-app/workflow.types";
import { ValidationCodes } from "@types-app/workflow.types";

export function validateWorkflowGraph(graph: WorkflowGraph): ValidationResult {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = graph;

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const inDegree = new Map<string, number>(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map<string, string[]>(nodes.map((node) => [node.id, []]));
  const incoming = new Map<string, string[]>(nodes.map((node) => [node.id, []]));

  const startNodes = nodes.filter((node) => node.type === "startNode");
  const endNodes = nodes.filter((node) => node.type === "endNode");

  if (startNodes.length === 0) {
    issues.push({
      message: "Workflow must include exactly one Start node.",
      severity: "error",
      code: ValidationCodes.MISSING_START,
    });
  }

  if (startNodes.length > 1) {
    for (const node of startNodes) {
      issues.push({
        nodeId: node.id,
        message: "Only one Start node is allowed.",
        severity: "error",
        code: ValidationCodes.MULTIPLE_STARTS,
      });
    }
  }

  if (endNodes.length === 0) {
    issues.push({
      message: "Workflow must include at least one End node.",
      severity: "error",
      code: ValidationCodes.MISSING_END,
    });
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      continue;
    }

    outgoing.get(edge.source)?.push(edge.target);
    incoming.get(edge.target)?.push(edge.source);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  for (const startNode of startNodes) {
    if ((incoming.get(startNode.id)?.length ?? 0) > 0) {
      issues.push({
        nodeId: startNode.id,
        message: "Start nodes cannot have incoming connections.",
        severity: "error",
        code: ValidationCodes.START_HAS_INCOMING,
      });
    }
  }

  for (const endNode of endNodes) {
    if ((outgoing.get(endNode.id)?.length ?? 0) > 0) {
      issues.push({
        nodeId: endNode.id,
        message: "End nodes cannot have outgoing connections.",
        severity: "error",
        code: ValidationCodes.END_HAS_OUTGOING,
      });
    }
  }

  for (const node of nodes) {
    const hasConnections =
      (incoming.get(node.id)?.length ?? 0) > 0 || (outgoing.get(node.id)?.length ?? 0) > 0;

    if (!hasConnections && nodes.length > 1) {
      issues.push({
        nodeId: node.id,
        message: `"${getNodeLabel(node.data)}" is disconnected from the workflow.`,
        severity: "error",
        code: ValidationCodes.DISCONNECTED_GRAPH,
      });
    }

    const label = getNodeLabel(node.data);
    if (label === "Untitled") {
      issues.push({
        nodeId: node.id,
        message: "This node should have a descriptive label.",
        severity: "warning",
        code: ValidationCodes.EMPTY_LABEL,
      });
    }

    if (node.type === "automatedStepNode" && !String(node.data.actionId ?? "").trim()) {
      issues.push({
        nodeId: node.id,
        message: "Select an automation action before running this workflow.",
        severity: "error",
        code: ValidationCodes.MISSING_ACTION,
      });
    }
  }

  const queue = [
    ...nodes.filter((node) => (inDegree.get(node.id) ?? 0) === 0).map((node) => node.id),
  ];
  const visited: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    visited.push(current);
    for (const neighbor of outgoing.get(current) ?? []) {
      const nextDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, nextDegree);
      if (nextDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (visited.length !== nodes.length) {
    issues.push({
      message: "Workflow contains a cycle. Loops are not supported in this prototype.",
      severity: "error",
      code: ValidationCodes.CYCLE_DETECTED,
    });
  }

  const issuesByNode: Record<string, ValidationIssue[]> = {};
  for (const issue of issues) {
    if (!issue.nodeId) {
      continue;
    }

    issuesByNode[issue.nodeId] ??= [];
    issuesByNode[issue.nodeId]?.push(issue);
  }

  return {
    isValid: issues.every((issue) => issue.severity !== "error"),
    issues,
    issuesByNode,
  };
}
