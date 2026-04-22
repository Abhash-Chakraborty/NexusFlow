import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workflows = sqliteTable(
  "workflows",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    graphJson: text("graph_json").notNull(),
    version: integer("version").notNull().default(1),
    nodeCount: integer("node_count").notNull().default(0),
    edgeCount: integer("edge_count").notNull().default(0),
    isValid: integer("is_valid", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (table) => [index("idx_workflows_updated_at").on(table.updatedAt)],
);

export const nodeVersions = sqliteTable(
  "node_versions",
  {
    id: text("id").primaryKey(),
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    nodeId: text("node_id").notNull(),
    nodeType: text("node_type").notNull(),
    dataJson: text("data_json").notNull(),
    label: text("label").notNull(),
    createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (table) => [index("idx_node_versions_workflow_node").on(table.workflowId, table.nodeId)],
);

export const simulationRuns = sqliteTable(
  "simulation_runs",
  {
    id: text("id").primaryKey(),
    workflowId: text("workflow_id"),
    graphSnapshotJson: text("graph_snapshot_json").notNull(),
    resultJson: text("result_json").notNull(),
    durationMs: integer("duration_ms").notNull(),
    success: integer("success", { mode: "boolean" }).notNull(),
    createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (table) => [index("idx_simulation_runs_workflow").on(table.workflowId)],
);

export type WorkflowRow = typeof workflows.$inferSelect;
export type WorkflowInsert = typeof workflows.$inferInsert;
export type NodeVersionRow = typeof nodeVersions.$inferSelect;
export type NodeVersionInsert = typeof nodeVersions.$inferInsert;
export type SimulationRunInsert = typeof simulationRuns.$inferInsert;
