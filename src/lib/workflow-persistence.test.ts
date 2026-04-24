import { describe, expect, it } from "vitest";

import { groupNodeVersions, parseStoredWorkflowGraph } from "./workflow-persistence";

describe("workflow persistence helpers", () => {
  it("rejects corrupted stored workflow JSON", () => {
    const result = parseStoredWorkflowGraph("{bad json");

    expect(result.ok).toBe(false);
  });

  it("rejects stored graphs that do not match the workflow schema", () => {
    const result = parseStoredWorkflowGraph(JSON.stringify({ nodes: "bad", edges: [] }));

    expect(result.ok).toBe(false);
  });

  it("groups valid node versions and skips corrupted entries", () => {
    const versions = groupNodeVersions([
      {
        id: "nv-1",
        workflowId: "wf-1",
        nodeId: "task-1",
        nodeType: "taskNode",
        label: "Initial task",
        createdAt: "2026-04-24T06:00:00.000Z",
        dataJson: JSON.stringify({
          nodeType: "taskNode",
          label: "Task",
          description: "",
          assignee: "",
          dueDate: "",
          priority: "medium",
          customFields: [],
        }),
      },
      {
        id: "nv-2",
        workflowId: "wf-1",
        nodeId: "task-1",
        nodeType: "taskNode",
        label: "Broken task",
        createdAt: "2026-04-24T06:01:00.000Z",
        dataJson: "{bad json",
      },
    ]);

    expect(versions["task-1"]).toHaveLength(1);
    expect(versions["task-1"]?.[0]?.label).toBe("Initial task");
  });
});
