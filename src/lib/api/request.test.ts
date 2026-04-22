import { createWorkflowRequestSchema } from "@lib/workflow-schemas";
import { describe, expect, it } from "vitest";

import { MAX_REQUEST_BODY_BYTES, parseJsonBody } from "./request";

function validWorkflowPayload() {
  return {
    name: "Valid Workflow",
    description: "A safe description",
    graph: {
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
        },
      ],
    },
  };
}

describe("parseJsonBody", () => {
  it("rejects oversized request bodies with 413", async () => {
    const hugePayload = "x".repeat(MAX_REQUEST_BODY_BYTES + 1);
    const request = new Request("http://localhost/api/workflows", {
      method: "POST",
      headers: {
        "content-length": String(MAX_REQUEST_BODY_BYTES + 1),
      },
      body: hugePayload,
    });

    const result = await parseJsonBody(request, createWorkflowRequestSchema);
    expect(result.response?.status).toBe(413);
  });

  it("rejects malformed JSON with 400", async () => {
    const request = new Request("http://localhost/api/workflows", {
      method: "POST",
      body: "{bad json",
    });

    const result = await parseJsonBody(request, createWorkflowRequestSchema);
    expect(result.response?.status).toBe(400);
  });

  it("rejects unsupported control characters with 422", async () => {
    const request = new Request("http://localhost/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        ...validWorkflowPayload(),
        name: "Hello\u0007",
      }),
    });

    const result = await parseJsonBody(request, createWorkflowRequestSchema);
    expect(result.response?.status).toBe(422);
  });

  it("strips unknown fields while preserving plain text content", async () => {
    const request = new Request("http://localhost/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        ...validWorkflowPayload(),
        name: "<script>alert(1)</script>",
        evil: "drop table",
      }),
    });

    const result = await parseJsonBody(request, createWorkflowRequestSchema);
    expect(result.data?.name).toBe("<script>alert(1)</script>");
    expect("evil" in (result.data ?? {})).toBe(false);
  });
});
