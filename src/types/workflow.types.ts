import type { Edge, Node } from "@xyflow/react";

export interface KeyValuePair {
  readonly id: string;
  key: string;
  value: string;
}

export interface StartNodeData extends Record<string, unknown> {
  nodeType: "startNode";
  label: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData extends Record<string, unknown> {
  nodeType: "taskNode";
  label: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData extends Record<string, unknown> {
  nodeType: "approvalNode";
  label: string;
  approverRole: "Manager" | "HRBP" | "Director" | "VP" | "CXO";
  autoApproveThreshold: number;
  requireAllApprovers: boolean;
  timeoutHours: number;
}

export interface AutomatedStepNodeData extends Record<string, unknown> {
  nodeType: "automatedStepNode";
  label: string;
  actionId: string;
  actionParams: Readonly<Record<string, string>>;
}

export interface EndNodeData extends Record<string, unknown> {
  nodeType: "endNode";
  label: string;
  endMessage: string;
  showSummary: boolean;
  outcomeType: "success" | "failure" | "cancelled";
}

export type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

export type NodeType = NodeData["nodeType"];

export type WorkflowNode = Node<NodeData, NodeType>;
export type StartWorkflowNode = Node<StartNodeData, "startNode">;
export type TaskWorkflowNode = Node<TaskNodeData, "taskNode">;
export type ApprovalWorkflowNode = Node<ApprovalNodeData, "approvalNode">;
export type AutomatedWorkflowNode = Node<AutomatedStepNodeData, "automatedStepNode">;
export type EndWorkflowNode = Node<EndNodeData, "endNode">;
export type WorkflowEdge = Edge<Record<string, never>>;

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  graph: WorkflowGraph;
  version: number;
  nodeCount: number;
  edgeCount: number;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
  nodeVersionHistory?: Record<string, NodeVersion[]>;
}

export interface WorkflowListItem extends Omit<SavedWorkflow, "graph"> {}

export interface ImportedWorkflowFile {
  name: string;
  description: string;
  graph: WorkflowGraph;
}

export interface NodeVersion {
  id: string;
  workflowId: string;
  nodeId: string;
  nodeType: NodeType;
  data: NodeData;
  label: string;
  createdAt: string;
}

export type ValidationSeverity = "error" | "warning";

export const ValidationCodes = {
  CYCLE_DETECTED: "CYCLE_DETECTED",
  DISCONNECTED_GRAPH: "DISCONNECTED_GRAPH",
  END_HAS_OUTGOING: "END_HAS_OUTGOING",
  EMPTY_LABEL: "EMPTY_LABEL",
  MISSING_ACTION: "MISSING_ACTION",
  MISSING_END: "MISSING_END",
  MISSING_START: "MISSING_START",
  MULTIPLE_STARTS: "MULTIPLE_STARTS",
  START_HAS_INCOMING: "START_HAS_INCOMING",
} as const;

export type ValidationCode = (typeof ValidationCodes)[keyof typeof ValidationCodes];

export interface ValidationIssue {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: ValidationSeverity;
  code: ValidationCode;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  issuesByNode: Record<string, ValidationIssue[]>;
}
