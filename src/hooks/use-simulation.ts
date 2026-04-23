"use client";

import { useMutation } from "@tanstack/react-query";
import type { SimulateRequest, SimulateResponse } from "@types-app/api.types";
import { useState } from "react";

export function useSimulation() {
  const [result, setResult] = useState<SimulateResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: SimulateRequest) => {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string | undefined;
        } | null;
        throw new Error(payload?.error ?? "Failed to simulate workflow");
      }

      const payload = (await response.json()) as { data: SimulateResponse };
      return payload.data;
    },
    onSuccess: (payload) => {
      setResult(payload);
    },
  });

  return {
    clearResult: () => setResult(null),
    result,
    ...mutation,
  };
}
