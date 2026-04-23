"use client";

import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useNodeValidationIssues } from "@hooks/use-workflow-store";
import type { ApprovalWorkflowNode } from "@types-app/workflow.types";
import { Badge } from "@ui/badge";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import { BaseNode } from "./BaseNode";

export const ApprovalNode = memo(function ApprovalNode({
  data,
  id,
  selected,
}: NodeProps<ApprovalWorkflowNode>) {
  const validationIssues = useNodeValidationIssues(id);

  return (
    <BaseNode
      config={NODE_TYPE_CONFIGS.approvalNode}
      id={id}
      label={data.label}
      nodeType="approvalNode"
      selected={selected}
      subtitle="Decision gate"
      validationIssues={validationIssues}
    >
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="warning">{data.approverRole}</Badge>
          <span className="truncate">
            {data.requireAllApprovers ? "All approvers" : "Single approver"}
          </span>
        </div>
        <span className="line-clamp-1">Auto-approve: {data.autoApproveThreshold}%</span>
      </div>
    </BaseNode>
  );
});
