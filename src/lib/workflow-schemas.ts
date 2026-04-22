import { z } from "zod";

function hasUnsupportedControlCharacters(value: string) {
  for (const char of value) {
    const code = char.charCodeAt(0);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    if (!isAllowedWhitespace && (code < 32 || code === 127)) {
      return true;
    }
  }

  return false;
}

export function safeTextSchema(max: number, options?: { allowEmpty?: boolean }) {
  const allowEmpty = options?.allowEmpty ?? true;

  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length <= max, `Must be ${max} characters or fewer`)
    .refine((value) => allowEmpty || value.length > 0, "This field is required")
    .refine(
      (value) => !hasUnsupportedControlCharacters(value),
      "Contains unsupported control characters",
    );
}

export const keyValuePairSchema = z
  .object({
    id: safeTextSchema(64, { allowEmpty: false }),
    key: safeTextSchema(80),
    value: safeTextSchema(240),
  })
  .strip();

export const startNodeDataSchema = z
  .object({
    nodeType: z.literal("startNode"),
    label: safeTextSchema(80),
    metadata: z.array(keyValuePairSchema).max(10),
  })
  .strip();

export const taskNodeDataSchema = z
  .object({
    nodeType: z.literal("taskNode"),
    label: safeTextSchema(80),
    description: safeTextSchema(500),
    assignee: safeTextSchema(120),
    dueDate: safeTextSchema(32),
    priority: z.enum(["low", "medium", "high", "critical"]),
    customFields: z.array(keyValuePairSchema).max(10),
  })
  .strip();

export const approvalNodeDataSchema = z
  .object({
    nodeType: z.literal("approvalNode"),
    label: safeTextSchema(80),
    approverRole: z.enum(["Manager", "HRBP", "Director", "VP", "CXO"]),
    autoApproveThreshold: z.number().min(0).max(100),
    requireAllApprovers: z.boolean(),
    timeoutHours: z.number().int().min(0).max(720),
  })
  .strip();

export const automatedStepNodeDataSchema = z
  .object({
    nodeType: z.literal("automatedStepNode"),
    label: safeTextSchema(80),
    actionId: safeTextSchema(80),
    actionParams: z.record(safeTextSchema(240)),
  })
  .strip();

export const endNodeDataSchema = z
  .object({
    nodeType: z.literal("endNode"),
    label: safeTextSchema(80),
    endMessage: safeTextSchema(280),
    showSummary: z.boolean(),
    outcomeType: z.enum(["success", "failure", "cancelled"]),
  })
  .strip();

export const nodeDataSchema = z.discriminatedUnion("nodeType", [
  startNodeDataSchema,
  taskNodeDataSchema,
  approvalNodeDataSchema,
  automatedStepNodeDataSchema,
  endNodeDataSchema,
]);

export const workflowNodeSchema = z
  .object({
    id: safeTextSchema(120, { allowEmpty: false }),
    type: z.enum(["startNode", "taskNode", "approvalNode", "automatedStepNode", "endNode"]),
    position: z.object({
      x: z.number().finite(),
      y: z.number().finite(),
    }),
    data: nodeDataSchema,
  })
  .strip()
  .superRefine((node, ctx) => {
    if (node.type !== node.data.nodeType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Node type and node data type must match",
        path: ["data", "nodeType"],
      });
    }
  });

export const workflowEdgeSchema = z
  .object({
    id: safeTextSchema(120, { allowEmpty: false }),
    type: z.literal("default").default("default"),
    source: safeTextSchema(120, { allowEmpty: false }),
    target: safeTextSchema(120, { allowEmpty: false }),
    sourceHandle: safeTextSchema(60)
      .nullish()
      .transform((value) => value ?? null),
    targetHandle: safeTextSchema(60)
      .nullish()
      .transform((value) => value ?? null),
    animated: z.boolean().default(false),
  })
  .strip();

export const workflowGraphSchema = z
  .object({
    nodes: z.array(workflowNodeSchema),
    edges: z.array(workflowEdgeSchema),
  })
  .strip();

export const createWorkflowRequestSchema = z
  .object({
    name: safeTextSchema(100, { allowEmpty: false }),
    description: safeTextSchema(500).default(""),
    graph: workflowGraphSchema,
  })
  .strip();

export const updateWorkflowRequestSchema = z
  .object({
    name: safeTextSchema(100).optional(),
    description: safeTextSchema(500).optional(),
    graph: workflowGraphSchema.optional(),
    expectedVersion: z.number().int().positive(),
  })
  .strip();

export const simulateRequestSchema = z
  .object({
    graph: workflowGraphSchema,
    workflowId: safeTextSchema(120).optional(),
    force: z.boolean().default(false),
  })
  .strip();

export const importedWorkflowFileSchema = z
  .object({
    name: safeTextSchema(100, { allowEmpty: false }),
    description: safeTextSchema(500).default(""),
    graph: workflowGraphSchema,
  })
  .strip();

export type ImportedWorkflowFileSchema = z.infer<typeof importedWorkflowFileSchema>;
