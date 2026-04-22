import type { NodeType } from "@types-app/workflow.types";
import type { LucideIcon } from "lucide-react";
import { Bot, CheckCircle2, ClipboardList, Flag, Play } from "lucide-react";

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  colorHex: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  inputHandles: number;
  outputHandles: number;
  outputLabels?: string[];
}

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  startNode: {
    type: "startNode",
    label: "Start",
    description: "The entry point of your workflow.",
    icon: Play,
    color: "--color-node-start",
    colorHex: "#10b981",
    bgColor: "var(--color-node-start-bg)",
    borderColor: "var(--color-node-start-border)",
    glowColor: "var(--color-node-start-glow)",
    inputHandles: 0,
    outputHandles: 1,
  },
  taskNode: {
    type: "taskNode",
    label: "Task",
    description: "A human-owned task with rich detail fields.",
    icon: ClipboardList,
    color: "--color-node-task",
    colorHex: "#0ea5e9",
    bgColor: "var(--color-node-task-bg)",
    borderColor: "var(--color-node-task-border)",
    glowColor: "var(--color-node-task-glow)",
    inputHandles: 1,
    outputHandles: 1,
  },
  approvalNode: {
    type: "approvalNode",
    label: "Approval",
    description: "A branching approval gate with decision outputs.",
    icon: CheckCircle2,
    color: "--color-node-approval",
    colorHex: "#f59e0b",
    bgColor: "var(--color-node-approval-bg)",
    borderColor: "var(--color-node-approval-border)",
    glowColor: "var(--color-node-approval-glow)",
    inputHandles: 1,
    outputHandles: 2,
    outputLabels: ["Approved", "Rejected"],
  },
  automatedStepNode: {
    type: "automatedStepNode",
    label: "Automation",
    description: "A system action powered by a mock automation.",
    icon: Bot,
    color: "--color-node-automated",
    colorHex: "#8b5cf6",
    bgColor: "var(--color-node-automated-bg)",
    borderColor: "var(--color-node-automated-border)",
    glowColor: "var(--color-node-automated-glow)",
    inputHandles: 1,
    outputHandles: 1,
  },
  endNode: {
    type: "endNode",
    label: "End",
    description: "A terminal outcome for the workflow.",
    icon: Flag,
    color: "--color-node-end",
    colorHex: "#ef476f",
    bgColor: "var(--color-node-end-bg)",
    borderColor: "var(--color-node-end-border)",
    glowColor: "var(--color-node-end-glow)",
    inputHandles: 1,
    outputHandles: 0,
  },
};
