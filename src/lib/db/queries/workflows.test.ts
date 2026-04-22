import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { WorkflowGraph } from "@types-app/workflow.types";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const migrationPath = path.join(process.cwd(), "drizzle", "migrations", "0000_yummy_the_spike.sql");

const baseGraph: WorkflowGraph = {
  nodes: [
    {
      id: "start",
      type: "startNode",
      position: { x: 0, y: 0 },
      data: { nodeType: "startNode", label: "Start", metadata: [] },
    },
    {
      id: "end",
      type: "endNode",
      position: { x: 0, y: 100 },
      data: {
        nodeType: "endNode",
        label: "End",
        endMessage: "Done",
        showSummary: true,
        outcomeType: "success",
      },
    },
  ],
  edges: [
    {
      id: "edge-1",
      type: "default",
      source: "start",
      target: "end",
      sourceHandle: null,
      targetHandle: null,
      animated: false,
      data: {},
    },
  ],
};

let dbFilePath = "";

beforeEach(() => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "nexusflow-"));
  dbFilePath = path.join(tempDir, "test.db");
  const sqlite = new Database(dbFilePath);
  sqlite.exec(readFileSync(migrationPath, "utf8"));
  sqlite.close();
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", `file:${dbFilePath}`);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("workflow queries", () => {
  it("returns null for optimistic-lock conflicts", async () => {
    const { createWorkflow, getWorkflowById, updateWorkflow } = await import("./workflows");

    const created = await createWorkflow({
      name: "Workflow",
      description: "",
      graphJson: JSON.stringify(baseGraph),
      nodeCount: baseGraph.nodes.length,
      edgeCount: baseGraph.edges.length,
      isValid: true,
    });

    expect(created).not.toBeNull();
    if (!created) {
      throw new Error("Expected workflow creation to succeed");
    }

    const initial = await getWorkflowById(created.id);
    expect(initial?.version).toBe(1);

    const firstUpdate = await updateWorkflow(created.id, 1, {
      name: "Workflow Updated",
      description: "",
      graphJson: JSON.stringify(baseGraph),
      nodeCount: baseGraph.nodes.length,
      edgeCount: baseGraph.edges.length,
      isValid: true,
    });
    expect(firstUpdate?.version).toBe(2);

    const staleUpdate = await updateWorkflow(created.id, 1, {
      name: "Workflow Stale",
      description: "",
      graphJson: JSON.stringify(baseGraph),
      nodeCount: baseGraph.nodes.length,
      edgeCount: baseGraph.edges.length,
      isValid: true,
    });

    expect(staleUpdate).toBeNull();
  });
});
