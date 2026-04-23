"use client";

import { NodeVersionHistory } from "@components/history/NodeVersionHistory";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import type { TaskNodeData, WorkflowNode } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Textarea } from "@ui/textarea";

import { FormField } from "./shared/FormField";
import { KeyValueEditor } from "./shared/KeyValueEditor";

interface TaskNodeFormProps {
  node: WorkflowNode & { data: TaskNodeData };
}

export function TaskNodeForm({ node }: TaskNodeFormProps) {
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
        <FormField label="Description">
          <Textarea
            value={node.data.description}
            onChange={(event) => updateNodeData(node.id, { description: event.target.value })}
          />
        </FormField>
        <FormField label="Assignee">
          <Input
            value={node.data.assignee}
            onChange={(event) => updateNodeData(node.id, { assignee: event.target.value })}
          />
        </FormField>
        <FormField label="Due Date">
          <Input
            type="date"
            value={node.data.dueDate}
            onChange={(event) => updateNodeData(node.id, { dueDate: event.target.value })}
          />
        </FormField>
        <FormField label="Priority">
          <Select
            value={node.data.priority}
            onValueChange={(priority: TaskNodeData["priority"]) =>
              updateNodeData(node.id, { priority })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["low", "medium", "high", "critical"].map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Custom Fields">
          <KeyValueEditor
            pairs={node.data.customFields}
            onChange={(customFields) => updateNodeData(node.id, { customFields })}
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
