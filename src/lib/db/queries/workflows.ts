import { createId } from "@lib/utils";
import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "../index";
import { workflows } from "../schema";

export async function listWorkflows() {
  const db = getDb();
  return db
    .select({
      id: workflows.id,
      name: workflows.name,
      description: workflows.description,
      version: workflows.version,
      nodeCount: workflows.nodeCount,
      edgeCount: workflows.edgeCount,
      isValid: workflows.isValid,
      createdAt: workflows.createdAt,
      updatedAt: workflows.updatedAt,
    })
    .from(workflows)
    .orderBy(desc(workflows.updatedAt))
    .limit(50);
}

export async function getWorkflowById(id: string) {
  const db = getDb();
  const row = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return row[0] ?? null;
}

export async function createWorkflow(input: {
  name: string;
  description: string;
  graphJson: string;
  nodeCount: number;
  edgeCount: number;
  isValid: boolean;
}) {
  const db = getDb();
  const id = createId("wf");
  await db.insert(workflows).values({
    id,
    name: input.name,
    description: input.description,
    graphJson: input.graphJson,
    nodeCount: input.nodeCount,
    edgeCount: input.edgeCount,
    isValid: input.isValid,
    version: 1,
  });

  return getWorkflowById(id);
}

export async function updateWorkflow(
  id: string,
  expectedVersion: number,
  input: {
    name: string;
    description: string;
    graphJson: string;
    nodeCount: number;
    edgeCount: number;
    isValid: boolean;
  },
) {
  const db = getDb();
  const result = await db
    .update(workflows)
    .set({
      name: input.name,
      description: input.description,
      graphJson: input.graphJson,
      nodeCount: input.nodeCount,
      edgeCount: input.edgeCount,
      isValid: input.isValid,
      version: sql`${workflows.version} + 1`,
      updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
    })
    .where(and(eq(workflows.id, id), eq(workflows.version, expectedVersion)))
    .returning({ id: workflows.id });

  if (result.length === 0) {
    return null;
  }

  return getWorkflowById(id);
}

export async function deleteWorkflow(id: string) {
  const db = getDb();
  await db.delete(workflows).where(eq(workflows.id, id));
}
