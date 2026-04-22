export type ParamType = "text" | "email" | "select" | "number" | "url" | "textarea";

export interface AutomationParam {
  readonly key: string;
  readonly label: string;
  readonly type: ParamType;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly options?: readonly string[];
  readonly hint?: string;
}

export interface AutomationAction {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly category: "communication" | "data" | "document" | "integration" | "scheduling";
  readonly icon: string;
  readonly params: readonly AutomationParam[];
  readonly estimatedDurationMs: number;
}
