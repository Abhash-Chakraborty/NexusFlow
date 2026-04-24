"use client";

import { NodeVersionHistory } from "@components/history/NodeVersionHistory";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import type { EndNodeData, WorkflowNode } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Textarea } from "@ui/textarea";
import { Toggle } from "@ui/toggle";

import { FormField } from "./shared/FormField";

interface EndNodeFormProps {
  node: WorkflowNode & { data: EndNodeData };
}

export function EndNodeForm({ node }: EndNodeFormProps) {
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
        <FormField label="Outcome Type">
          <Select
            value={node.data.outcomeType}
            onValueChange={(outcomeType: EndNodeData["outcomeType"]) =>
              updateNodeData(node.id, { outcomeType })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["success", "failure", "cancelled"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="End Message">
          <Textarea
            value={node.data.endMessage}
            onChange={(event) => updateNodeData(node.id, { endMessage: event.target.value })}
          />
        </FormField>
        <FormField label="Show Summary">
          <div className="flex items-center justify-between rounded-[14px] border border-border-default bg-surface-0 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Display a summary card</p>
              <p className="text-xs text-text-secondary">
                Include a summary in the simulation output.
              </p>
            </div>
            <Toggle
              checked={node.data.showSummary}
              onCheckedChange={(showSummary) => updateNodeData(node.id, { showSummary })}
            />
          </div>
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
