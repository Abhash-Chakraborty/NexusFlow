"use client";

import { useToast } from "@components/providers/ToastProvider";
import { useDeleteWorkflow, useWorkflowList } from "@hooks/use-saved-workflows";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import { useQueryClient } from "@tanstack/react-query";
import type { SavedWorkflow } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { EmptyState } from "@ui/empty-state";
import { FileStack, LoaderCircle, Trash2 } from "lucide-react";

export function WorkflowListSidebar() {
  const { data: workflows = [], isLoading } = useWorkflowList();
  const deleteWorkflow = useDeleteWorkflow();
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const loadSavedWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error("Failed to load workflow");
      }

      const payload = (await response.json()) as { data: SavedWorkflow };
      loadWorkflow(payload.data);
      queryClient.setQueryData(["workflows", workflowId], payload.data);
      showToast({ tone: "success", title: "Workflow loaded", description: payload.data.name });
    } catch (error) {
      showToast({
        tone: "error",
        title: "Load failed",
        description: error instanceof Error ? error.message : "Could not load workflow",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <EmptyState description="Saved flows appear here." Icon={FileStack} title="No saved flows" />
    );
  }

  return (
    <div className="space-y-2">
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className="rounded-[22px] border border-border-default bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold tracking-[-0.02em] text-text-primary">
                {workflow.name}
              </p>
              <p className="mt-1 line-clamp-1 text-xs uppercase tracking-[0.12em] text-text-muted">
                {workflow.nodeCount} steps | {workflow.edgeCount} links
              </p>
            </div>
            <Button
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => deleteWorkflow.mutate(workflow.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="mt-2 w-full"
            size="sm"
            type="button"
            onClick={() => loadSavedWorkflow(workflow.id)}
          >
            Open
          </Button>
        </div>
      ))}
    </div>
  );
}
