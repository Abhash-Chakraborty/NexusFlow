import { parseJsonBody } from "@lib/api/request";
import { apiSuccess, withErrorHandler } from "@lib/api/response";
import { createWorkflow, listWorkflows } from "@lib/db/queries";
import { createWorkflowRequestSchema } from "@lib/workflow-schemas";
import { validateWorkflowGraph } from "@lib/workflow-validator";
import type { WorkflowGraph } from "@types-app/workflow.types";

export const GET = withErrorHandler(async () => {
  const workflows = await listWorkflows();
  return apiSuccess(workflows);
});

export const POST = withErrorHandler(async (request: Request) => {
  const parsed = await parseJsonBody(request, createWorkflowRequestSchema);
  if (parsed.response) {
    return parsed.response;
  }

  const graph = parsed.data.graph as WorkflowGraph;
  const validation = validateWorkflowGraph(graph);
  const workflow = await createWorkflow({
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    graphJson: JSON.stringify(graph),
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    isValid: validation.isValid,
  });

  return apiSuccess(workflow, 201);
});
