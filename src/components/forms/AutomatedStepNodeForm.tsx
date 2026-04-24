"use client";

import { NodeVersionHistory } from "@components/history/NodeVersionHistory";
import { useAutomations } from "@hooks/use-automations";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import type { AutomatedStepNodeData, WorkflowNode } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Spinner } from "@ui/spinner";
import { DynamicParamFields } from "./shared/DynamicParamFields";
import { FormField } from "./shared/FormField";

interface AutomatedStepNodeFormProps {
  node: WorkflowNode & { data: AutomatedStepNodeData };
}

export function AutomatedStepNodeForm({ node }: AutomatedStepNodeFormProps) {
  const { data: actions = [], isLoading } = useAutomations();
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
        <FormField label="Automation Action">
          {isLoading ? (
            <div className="flex h-11 items-center rounded-[12px] border border-border-default bg-surface-0 px-3">
              <Spinner />
              <span className="ml-2 text-sm text-text-secondary">Loading actions...</span>
            </div>
          ) : (
            <Select
              value={node.data.actionId}
              onValueChange={(actionId) => updateNodeData(node.id, { actionId })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField label="Action Parameters">
          <DynamicParamFields
            actionId={node.data.actionId}
            actionParams={node.data.actionParams}
            actions={actions}
            onChange={(actionParams) => updateNodeData(node.id, { actionParams })}
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
