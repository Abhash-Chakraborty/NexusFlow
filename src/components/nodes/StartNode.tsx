"use client";

import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useNodeValidationIssues } from "@hooks/use-workflow-store";
import type { StartWorkflowNode } from "@types-app/workflow.types";
import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import { BaseNode } from "./BaseNode";

export const StartNode = memo(function StartNode({
  data,
  id,
  selected,
}: NodeProps<StartWorkflowNode>) {
  const validationIssues = useNodeValidationIssues(id);

  return (
    <BaseNode
      config={NODE_TYPE_CONFIGS.startNode}
      id={id}
      label={data.label}
      nodeType="startNode"
      selected={selected}
      showInputHandle={false}
      subtitle="Trigger"
      validationIssues={validationIssues}
    >
      <p className="line-clamp-2 text-sm leading-5 text-text-secondary">
        {data.metadata.length > 0 ? `${data.metadata.length} metadata field(s)` : "No metadata"}
      </p>
    </BaseNode>
  );
});
