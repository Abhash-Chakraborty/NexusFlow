"use client";

import { useWorkflowStore } from "./use-workflow-store";

export function useWorkflowValidation() {
  const validationResult = useWorkflowStore((state) => state.validationResult);
  const runValidation = useWorkflowStore((state) => state.runValidation);

  return {
    validationResult,
    runValidation,
  };
}
