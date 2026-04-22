import type { NodeData } from "@types-app/workflow.types";
import { clsx } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function createId(prefix?: string) {
  return prefix ? `${prefix}-${nanoid(8)}` : nanoid(12);
}

export function formatDate(value: string) {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatRelativeTimestamp(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function getNodeLabel(data: Partial<NodeData> | Record<string, unknown>) {
  const label = data.label;
  return typeof label === "string" && label.trim() ? label.trim() : "Untitled";
}

export function downloadJson(filename: string, content: unknown) {
  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
