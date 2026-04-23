"use client";

import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useNodeValidationIssues } from "@hooks/use-workflow-store";
import type { EndNodeData, EndWorkflowNode } from "@types-app/workflow.types";
import { Badge } from "@ui/badge";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import { BaseNode } from "./BaseNode";

const outcomeTone: Record<EndNodeData["outcomeType"], "error" | "muted" | "success"> = {
  cancelled: "muted",
  failure: "error",
  success: "success",
};

export const EndNode = memo(function EndNode({ data, id, selected }: NodeProps<EndWorkflowNode>) {
  const validationIssues = useNodeValidationIssues(id);

  return (
    <BaseNode
      config={NODE_TYPE_CONFIGS.endNode}
      id={id}
      label={data.label}
      nodeType="endNode"
      selected={selected}
      showOutputHandle={false}
      subtitle="Outcome"
      validationIssues={validationIssues}
    >
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        <Badge tone={outcomeTone[data.outcomeType]}>{data.outcomeType}</Badge>
        <p className="line-clamp-2">{data.endMessage}</p>
      </div>
    </BaseNode>
  );
});
