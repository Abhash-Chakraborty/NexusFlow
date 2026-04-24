"use client";

import { NodeVersionHistory } from "@components/history/NodeVersionHistory";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import type { ApprovalNodeData, WorkflowNode } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Toggle } from "@ui/toggle";

import { FormField } from "./shared/FormField";

interface ApprovalNodeFormProps {
  node: WorkflowNode & { data: ApprovalNodeData };
}

export function ApprovalNodeForm({ node }: ApprovalNodeFormProps) {
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
        <FormField label="Approver Role">
          <Select
            value={node.data.approverRole}
            onValueChange={(approverRole: ApprovalNodeData["approverRole"]) =>
              updateNodeData(node.id, { approverRole })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Manager", "HRBP", "Director", "VP", "CXO"].map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Auto-Approve Threshold (%)">
          <Input
            max={100}
            min={0}
            type="number"
            value={String(node.data.autoApproveThreshold)}
            onChange={(event) =>
              updateNodeData(node.id, {
                autoApproveThreshold: Number(event.target.value || 0),
              })
            }
          />
        </FormField>
        <FormField label="Timeout Hours">
          <Input
            min={0}
            type="number"
            value={String(node.data.timeoutHours)}
            onChange={(event) =>
              updateNodeData(node.id, {
                timeoutHours: Number(event.target.value || 0),
              })
            }
          />
        </FormField>
        <FormField label="Require All Approvers">
          <div className="flex items-center justify-between rounded-[14px] border border-border-default bg-surface-0 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Strict approval path</p>
              <p className="text-xs text-text-secondary">
                Require every configured approver before continuing.
              </p>
            </div>
            <Toggle
              checked={node.data.requireAllApprovers}
              onCheckedChange={(requireAllApprovers) =>
                updateNodeData(node.id, { requireAllApprovers })
              }
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
