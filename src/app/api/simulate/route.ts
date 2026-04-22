import { parseJsonBody } from "@lib/api/request";
import { apiError, apiSuccess, withErrorHandler } from "@lib/api/response";
import { saveSimulationRun } from "@lib/db/queries";
import { simulateRequestSchema } from "@lib/workflow-schemas";
import { simulateWorkflow } from "@lib/workflow-simulator";
import { validateWorkflowGraph } from "@lib/workflow-validator";
import type { WorkflowGraph } from "@types-app/workflow.types";

export const POST = withErrorHandler(async (request: Request) => {
  const parsed = await parseJsonBody(request, simulateRequestSchema);
  if (parsed.response) {
    return parsed.response;
  }

  const graph = parsed.data.graph as WorkflowGraph;
  const validation = validateWorkflowGraph(graph);
  if (!validation.isValid && !parsed.data.force) {
    return apiError(
      "Workflow has validation errors. Pass force=true to simulate anyway.",
      "WORKFLOW_INVALID",
      422,
      { issues: validation.issues },
    );
  }

  const result = await simulateWorkflow(graph);
  await saveSimulationRun({
    workflowId: parsed.data.workflowId,
    graph,
    result,
  });

  return apiSuccess(result);
});
