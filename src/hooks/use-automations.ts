"use client";

import { useQuery } from "@tanstack/react-query";

import type { AutomationAction } from "@types-app/automation.types";

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      const response = await fetch("/api/automations");
      if (!response.ok) {
        throw new Error("Failed to fetch automation actions");
      }
      return (await response.json()) as AutomationAction[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: Infinity,
  });
}
