import { createId } from "@lib/utils";
import type { SimulateResponse } from "@types-app/api.types";
import type { WorkflowGraph } from "@types-app/workflow.types";

import { getDb } from "../index";
import { simulationRuns } from "../schema";

export async function saveSimulationRun(input: {
  workflowId?: string | undefined;
  graph: WorkflowGraph;
  result: SimulateResponse;
}) {
  const db = getDb();
  await db.insert(simulationRuns).values({
    id: createId("sim"),
    workflowId: input.workflowId ?? null,
    graphSnapshotJson: JSON.stringify(input.graph),
    resultJson: JSON.stringify(input.result),
    durationMs: input.result.totalDurationMs,
    success: input.result.success,
  });
}
