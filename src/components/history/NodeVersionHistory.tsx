"use client";

import { useNodeHistory } from "@hooks/use-node-history";
import { formatRelativeTimestamp } from "@lib/utils";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Button } from "@ui/button";
import { EmptyState } from "@ui/empty-state";
import { ChevronDown, History } from "lucide-react";
import { useState } from "react";

export function NodeVersionHistory() {
  const [open, setOpen] = useState(false);
  const { restoreNodeVersion, selectedNode, versions } = useNodeHistory();

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="mb-1.5 rounded-[18px] border border-border-default bg-surface-2/60">
        <Collapsible.Trigger className="flex w-full items-center justify-between px-3 py-2.5 text-left">
          <div>
            <p className="text-sm font-semibold text-text-primary">Snapshots</p>
            <p className="text-xs text-text-secondary">
              Restore recent edits for the selected node.
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-text-secondary transition ${open ? "rotate-180" : ""}`}
          />
        </Collapsible.Trigger>
        <Collapsible.Content className="space-y-2 border-t border-border-default px-3 py-3">
          {selectedNode && versions.length > 0 ? (
            versions.map((version) => (
              <div
                key={version.id}
                className="rounded-[14px] border border-border-default bg-surface-0 p-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{version.label}</p>
                    <p className="text-xs text-text-secondary">
                      Saved {formatRelativeTimestamp(version.createdAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    type="button"
                    variant="subtle"
                    onClick={() => restoreNodeVersion(version.nodeId, version.id)}
                  >
                    Restore
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              description="Live node edits will appear here for quick restoration."
              Icon={History}
              title="No history yet"
            />
          )}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
}
