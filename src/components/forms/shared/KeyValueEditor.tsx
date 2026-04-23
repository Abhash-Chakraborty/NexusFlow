"use client";

import type { KeyValuePair } from "@types-app/workflow.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Plus, Trash2 } from "lucide-react";

interface KeyValueEditorProps {
  keyPlaceholder?: string | undefined;
  maxPairs?: number | undefined;
  onChange: (pairs: KeyValuePair[]) => void;
  pairs: KeyValuePair[];
  valuePlaceholder?: string | undefined;
}

export function KeyValueEditor({
  keyPlaceholder = "Key",
  maxPairs = 10,
  onChange,
  pairs,
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const updatePair = (pairId: string, field: "key" | "value", value: string) => {
    onChange(pairs.map((pair) => (pair.id === pairId ? { ...pair, [field]: value } : pair)));
  };

  const deletePair = (pairId: string) => {
    onChange(pairs.filter((pair) => pair.id !== pairId));
  };

  return (
    <div className="space-y-2">
      {pairs.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-border-default bg-surface-2 px-4 py-3 text-sm text-text-secondary">
          No fields added yet
        </p>
      ) : (
        pairs.map((pair) => (
          <div key={pair.id} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-1.5">
            <Input
              placeholder={keyPlaceholder}
              value={pair.key}
              onChange={(event) => updatePair(pair.id, "key", event.target.value)}
            />
            <span className="text-text-secondary">=</span>
            <Input
              placeholder={valuePlaceholder}
              value={pair.value}
              onChange={(event) => updatePair(pair.id, "value", event.target.value)}
            />
            <Button size="icon" type="button" variant="ghost" onClick={() => deletePair(pair.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      <Button
        disabled={pairs.length >= maxPairs}
        size="sm"
        type="button"
        variant="subtle"
        onClick={() =>
          onChange([
            ...pairs,
            {
              id: crypto.randomUUID(),
              key: "",
              value: "",
            },
          ])
        }
      >
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
    </div>
  );
}
