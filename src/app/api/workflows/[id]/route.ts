import { parseJsonBody } from "@lib/api/request";

import { apiError, apiSuccess, withErrorHandler } from "@lib/api/response";
import {
  deleteWorkflow,
  getWorkflowById,
  listNodeVersionsByWorkflowId,
  snapshotChangedNodes,
  updateWorkflow,
} from "@lib/db/queries";
import { groupNodeVersions, parseStoredWorkflowGraph } from "@lib/workflow-persistence";
import { updateWorkflowRequestSchema } from "@lib/workflow-schemas";
import { validateWorkflowGraph } from "@lib/workflow-validator";
import type { WorkflowGraph } from "@types-app/workflow.types";
import { z } from "zod";

const routeParamsSchema = z.object({
  id: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function toSavedWorkflow(row: NonNullable<Awaited<ReturnType<typeof getWorkflowById>>>) {
  const parsedGraph = parseStoredWorkflowGraph(row.graphJson);
  if (!parsedGraph.ok) {
    return {
      error: apiError(
        "Stored workflow data is corrupted. Re-import or recreate this workflow.",
        "CORRUPTED_WORKFLOW",
        500,
        { reason: parsedGraph.error, workflowId: row.id },
      ),
      ok: false as const,
    };
  }

  const nodeVersions = await listNodeVersionsByWorkflowId(row.id);
  return {
    ok: true as const,
    workflow: {
      id: row.id,
      name: row.name,
      description: row.description,
      graph: parsedGraph.graph,
      version: row.version,
      nodeCount: row.nodeCount,
      edgeCount: row.edgeCount,
      isValid: row.isValid,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nodeVersionHistory: groupNodeVersions(nodeVersions),
    },
  };
}

export const GET = withErrorHandler(async (_request: Request, context: RouteContext) => {
  const routeParams = routeParamsSchema.safeParse(await context.params);
  if (!routeParams.success) {
    return apiError("Invalid workflow id", "VALIDATION_ERROR", 422, routeParams.error.flatten());
  }

  const workflow = await getWorkflowById(routeParams.data.id);
  if (!workflow) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  const savedWorkflow = await toSavedWorkflow(workflow);
  if (!savedWorkflow.ok) {
    return savedWorkflow.error;
  }

  return apiSuccess(savedWorkflow.workflow);
});

export const PUT = withErrorHandler(async (request: Request, context: RouteContext) => {
  const routeParams = routeParamsSchema.safeParse(await context.params);
  if (!routeParams.success) {
    return apiError("Invalid workflow id", "VALIDATION_ERROR", 422, routeParams.error.flatten());
  }

  const parsed = await parseJsonBody(request, updateWorkflowRequestSchema);
  if (parsed.response) {
    return parsed.response;
  }

  const existing = await getWorkflowById(routeParams.data.id);
  if (!existing) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  const parsedExistingGraph = parseStoredWorkflowGraph(existing.graphJson);
  if (!parsedExistingGraph.ok) {
    return apiError(
      "Stored workflow data is corrupted. Re-import or recreate this workflow.",
      "CORRUPTED_WORKFLOW",
      500,
      { reason: parsedExistingGraph.error, workflowId: existing.id },
    );
  }

  const nextGraph = (parsed.data.graph ?? parsedExistingGraph.graph) as WorkflowGraph;
  const validation = validateWorkflowGraph(nextGraph);

  if (parsed.data.graph) {
    await snapshotChangedNodes(routeParams.data.id, parsedExistingGraph.graph, nextGraph);
  }

  const updated = await updateWorkflow(routeParams.data.id, parsed.data.expectedVersion, {
    name: parsed.data.name ?? existing.name,
    description: parsed.data.description ?? existing.description,
    graphJson: JSON.stringify(nextGraph),
    nodeCount: nextGraph.nodes.length,
    edgeCount: nextGraph.edges.length,
    isValid: validation.isValid,
  });

  if (!updated) {
    return apiError(
      "Workflow version mismatch. Reload the saved workflow and try again.",
      "VERSION_CONFLICT",
      409,
    );
  }

  const savedWorkflow = await toSavedWorkflow(updated);
  if (!savedWorkflow.ok) {
    return savedWorkflow.error;
  }

  return apiSuccess(savedWorkflow.workflow);
});

export const DELETE = withErrorHandler(async (_request: Request, context: RouteContext) => {
  const routeParams = routeParamsSchema.safeParse(await context.params);
  if (!routeParams.success) {
    return apiError("Invalid workflow id", "VALIDATION_ERROR", 422, routeParams.error.flatten());
  }

  const existing = await getWorkflowById(routeParams.data.id);
  if (!existing) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  await deleteWorkflow(routeParams.data.id);
  return apiSuccess({ deleted: true, id: routeParams.data.id });
});
