"use client";

import type { AutomationAction } from "@types-app/automation.types";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Textarea } from "@ui/textarea";
import { useEffect, useMemo, useRef } from "react";

import { FormField } from "./FormField";

interface DynamicParamFieldsProps {
  actionId: string;
  actionParams: Readonly<Record<string, string>>;
  actions: AutomationAction[];
  onChange: (params: Readonly<Record<string, string>>) => void;
}

export function DynamicParamFields({
  actionId,
  actionParams,
  actions,
  onChange,
}: DynamicParamFieldsProps) {
  const previousActionId = useRef<string | null>(null);
  const selectedAction = useMemo(
    () => actions.find((action) => action.id === actionId) ?? null,
    [actionId, actions],
  );

  useEffect(() => {
    if (previousActionId.current && previousActionId.current !== actionId) {
      onChange({});
    }
    previousActionId.current = actionId;
  }, [actionId, onChange]);

  if (!selectedAction) {
    return (
      <p className="rounded-[12px] border border-dashed border-border-default bg-surface-2 px-4 py-3 text-sm text-text-secondary">
        Select an automation action to configure its parameters.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {selectedAction.params.map((param) => {
        const value = actionParams[param.key] ?? "";

        return (
          <FormField key={param.key} label={param.label} required={param.required}>
            {param.type === "textarea" ? (
              <Textarea
                placeholder={param.placeholder}
                value={value}
                onChange={(event) =>
                  onChange({
                    ...actionParams,
                    [param.key]: event.target.value,
                  })
                }
              />
            ) : param.type === "select" ? (
              <Select
                value={value}
                onValueChange={(nextValue) =>
                  onChange({
                    ...actionParams,
                    [param.key]: nextValue,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={param.placeholder ?? `Select ${param.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {(param.options ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={param.placeholder}
                type={param.type === "number" ? "number" : param.type}
                value={value}
                onChange={(event) =>
                  onChange({
                    ...actionParams,
                    [param.key]: event.target.value,
                  })
                }
              />
            )}
            {param.hint ? <p className="text-xs text-text-secondary">{param.hint}</p> : null}
          </FormField>
        );
      })}
    </div>
  );
}
