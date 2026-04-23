"use client";

import type { WorkflowNode } from "@types-app/workflow.types";

import { ApprovalNodeForm } from "./ApprovalNodeForm";
import { AutomatedStepNodeForm } from "./AutomatedStepNodeForm";
import { EndNodeForm } from "./EndNodeForm";
import { StartNodeForm } from "./StartNodeForm";
import { TaskNodeForm } from "./TaskNodeForm";

export function NodeFormPanel({ node }: { node: WorkflowNode }) {
  switch (node.type) {
    case "startNode":
      return (
        <StartNodeForm
          node={
            node as WorkflowNode & {
              data: Extract<WorkflowNode["data"], { nodeType: "startNode" }>;
            }
          }
        />
      );
    case "taskNode":
      return (
        <TaskNodeForm
          node={
            node as WorkflowNode & { data: Extract<WorkflowNode["data"], { nodeType: "taskNode" }> }
          }
        />
      );
    case "approvalNode":
      return (
        <ApprovalNodeForm
          node={
            node as WorkflowNode & {
              data: Extract<WorkflowNode["data"], { nodeType: "approvalNode" }>;
            }
          }
        />
      );
    case "automatedStepNode":
      return (
        <AutomatedStepNodeForm
          node={
            node as WorkflowNode & {
              data: Extract<WorkflowNode["data"], { nodeType: "automatedStepNode" }>;
            }
          }
        />
      );
    case "endNode":
      return (
        <EndNodeForm
          node={
            node as WorkflowNode & { data: Extract<WorkflowNode["data"], { nodeType: "endNode" }> }
          }
        />
      );
    default:
      return null;
  }
}
