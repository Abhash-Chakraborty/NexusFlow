"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SavedWorkflow, WorkflowListItem } from "@types-app/workflow.types";

const workflowListKey = ["workflows"] as const;

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string | undefined;
    } | null;
    throw new Error(payload?.error ?? "Request failed");
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export function useWorkflowList() {
  return useQuery({
    queryKey: workflowListKey,
    queryFn: async () => {
      const response = await fetch("/api/workflows");
      return readJson<WorkflowListItem[]>(response);
    },
  });
}

export function useWorkflow(workflowId: string | null) {
  return useQuery({
    queryKey: [...workflowListKey, workflowId],
    enabled: Boolean(workflowId),
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}`);
      return readJson<SavedWorkflow>(response);
    },
  });
}

export function useSaveWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      description: string;
      expectedVersion: number;
      graph: SavedWorkflow["graph"];
      id?: string | null | undefined;
      name: string;
    }) => {
      const url = input.id ? `/api/workflows/${input.id}` : "/api/workflows";
      const method = input.id ? "PUT" : "POST";
      const body = input.id
        ? {
            name: input.name,
            description: input.description,
            graph: input.graph,
            expectedVersion: input.expectedVersion,
          }
        : {
            name: input.name,
            description: input.description,
            graph: input.graph,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return readJson<SavedWorkflow>(response);
    },
    onSuccess: async (workflow) => {
      await queryClient.invalidateQueries({ queryKey: workflowListKey });
      queryClient.setQueryData([...workflowListKey, workflow.id], workflow);
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });
      return readJson<{ deleted: boolean; id: string }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workflowListKey });
    },
  });
}
