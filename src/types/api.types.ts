import type { ValidationIssue, WorkflowGraph, WorkflowListItem } from "@types-app/workflow.types";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: unknown | undefined;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface CreateWorkflowRequest {
  name: string;
  description?: string | undefined;
  graph: WorkflowGraph;
}

export interface UpdateWorkflowRequest {
  name?: string | undefined;
  description?: string | undefined;
  graph?: WorkflowGraph | undefined;
  expectedVersion: number;
}

export interface WorkflowListResponse {
  workflows: WorkflowListItem[];
}

export interface SimulateRequest {
  graph: WorkflowGraph;
  workflowId?: string | undefined;
  force?: boolean | undefined;
}

export type StepStatus = "failed" | "pending" | "running" | "skipped" | "success";

export interface SimulationStep {
  stepIndex: number;
  nodeId: string;
  nodeType: string;
  label: string;
  status: StepStatus;
  message: string;
  durationMs: number;
  timestamp: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface SimulateResponse {
  executionId: string;
  success: boolean;
  steps: SimulationStep[];
  summary: string;
  totalDurationMs: number;
  validationIssues: ValidationIssue[];
}
