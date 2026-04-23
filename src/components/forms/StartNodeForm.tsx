"use client";

import { NodeVersionHistory } from "@components/history/NodeVersionHistory";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import type { StartNodeData, WorkflowNode } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import { FormField } from "./shared/FormField";
import { KeyValueEditor } from "./shared/KeyValueEditor";

interface StartNodeFormProps {
  node: WorkflowNode & { data: StartNodeData };
}

export function StartNodeForm({ node }: StartNodeFormProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const selectNode = useWorkflowStore((state) => state.selectNode);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-2.5 pb-5">
        <FormField label="Label" required>
          <Input
            value={node.data.label}
            onChange={(event) => updateNodeData(node.id, { label: event.target.value })}
          />
        </FormField>
        <FormField
          description="Key-value metadata travels with the workflow for preview and simulation."
          label="Metadata"
        >
          <KeyValueEditor
            pairs={node.data.metadata}
            onChange={(metadata) => updateNodeData(node.id, { metadata })}
          />
        </FormField>
        <NodeVersionHistory />
      </div>
      <div className="border-t border-border-default px-3 py-3">
        <Button className="w-full" type="button" variant="subtle" onClick={() => selectNode(null)}>
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
