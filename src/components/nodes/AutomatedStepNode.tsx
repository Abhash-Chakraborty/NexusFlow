"use client";

import { getAutomationAction } from "@constants/automation-actions";
import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useNodeValidationIssues } from "@hooks/use-workflow-store";
import type { AutomatedWorkflowNode } from "@types-app/workflow.types";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import { BaseNode } from "./BaseNode";

export const AutomatedStepNode = memo(function AutomatedStepNode({
  data,
  id,
  selected,
}: NodeProps<AutomatedWorkflowNode>) {
  const validationIssues = useNodeValidationIssues(id);
  const action = getAutomationAction(data.actionId);

  return (
    <BaseNode
      config={NODE_TYPE_CONFIGS.automatedStepNode}
      id={id}
      label={data.label}
      nodeType="automatedStepNode"
      selected={selected}
      subtitle="System action"
      validationIssues={validationIssues}
    >
      <p
        className={
          data.actionId ? "text-sm text-text-secondary" : "text-sm text-[var(--color-warning)]"
        }
      >
        {action?.label ?? "No action selected"}
      </p>
    </BaseNode>
  );
});
