"use client";

import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useNodeValidationIssues } from "@hooks/use-workflow-store";
import type { TaskWorkflowNode } from "@types-app/workflow.types";
import { Badge } from "@ui/badge";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import { BaseNode } from "./BaseNode";

export const TaskNode = memo(function TaskNode({
  data,
  id,
  selected,
}: NodeProps<TaskWorkflowNode>) {
  const validationIssues = useNodeValidationIssues(id);

  return (
    <BaseNode
      config={NODE_TYPE_CONFIGS.taskNode}
      id={id}
      label={data.label}
      nodeType="taskNode"
      selected={selected}
      subtitle="Human task"
      validationIssues={validationIssues}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-secondary">
        <span className="min-w-0 flex-1 truncate">{data.assignee || "Unassigned"}</span>
        <Badge
          tone={data.priority === "critical" || data.priority === "high" ? "warning" : "accent"}
        >
          {data.priority}
        </Badge>
      </div>
    </BaseNode>
  );
});
