import { createId, getNodeLabel } from "@lib/utils";

import type { WorkflowGraph } from "@types-app/workflow.types";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "../index";
import { nodeVersions } from "../schema";

const MAX_VERSIONS_PER_NODE = 10;

export async function saveNodeVersion(input: {
  workflowId: string;
  nodeId: string;
  nodeType: string;
  dataJson: string;
  label: string;
}) {
  const db = getDb();
  await db.insert(nodeVersions).values({
    id: createId("nv"),
    workflowId: input.workflowId,
    nodeId: input.nodeId,
    nodeType: input.nodeType,
    dataJson: input.dataJson,
    label: input.label,
  });

  const history = await db
    .select({ id: nodeVersions.id })
    .from(nodeVersions)
    .where(
      and(eq(nodeVersions.workflowId, input.workflowId), eq(nodeVersions.nodeId, input.nodeId)),
    )
    .orderBy(desc(nodeVersions.createdAt));

  const staleRecords = history.slice(MAX_VERSIONS_PER_NODE);
  for (const record of staleRecords) {
    await db.delete(nodeVersions).where(eq(nodeVersions.id, record.id));
  }
}

export async function listNodeVersionsByWorkflowId(workflowId: string) {
  const db = getDb();
  return db
    .select()
    .from(nodeVersions)
    .where(eq(nodeVersions.workflowId, workflowId))
    .orderBy(desc(nodeVersions.createdAt));
}

export async function snapshotChangedNodes(
  workflowId: string,
  previousGraph: WorkflowGraph,
  nextGraph: WorkflowGraph,
) {
  const previousMap = new Map(previousGraph.nodes.map((node) => [node.id, node]));

  for (const nextNode of nextGraph.nodes) {
    const previousNode = previousMap.get(nextNode.id);
    if (!previousNode) {
      continue;
    }

    if (JSON.stringify(previousNode.data) === JSON.stringify(nextNode.data)) {
      continue;
    }

    await saveNodeVersion({
      workflowId,
      nodeId: previousNode.id,
      nodeType: previousNode.type,
      dataJson: JSON.stringify(previousNode.data),
      label: getNodeLabel(previousNode.data),
    });
  }
}
