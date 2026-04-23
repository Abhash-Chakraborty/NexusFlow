"use client";

import { NodeFormPanel } from "@components/forms/NodeFormPanel";
import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useSelectedNode } from "@hooks/use-workflow-store";
import { Badge } from "@ui/badge";
import { EmptyState } from "@ui/empty-state";
import { History, MousePointerClick, PanelRightOpen } from "lucide-react";

export function ConfigPanel() {
  const selectedNode = useSelectedNode();
  const selectedConfig = selectedNode ? NODE_TYPE_CONFIGS[selectedNode.type] : null;
  const SelectedIcon = selectedConfig?.icon;

  return (
    <aside className="surface-card flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[30px]">
      <div className="border-b border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,242,236,0.9))] px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={selectedNode ? "accent" : "muted"}>
            {selectedNode ? "Editing" : "Inspector"}
          </Badge>
          {selectedConfig && SelectedIcon ? (
            <div
              className="rounded-full border border-black/6 bg-surface-2 p-2"
              style={{ color: selectedConfig.colorHex }}
            >
              <SelectedIcon className="h-4 w-4" />
            </div>
          ) : null}
        </div>
        <p className="mt-2 font-display text-[1.1rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
          {selectedNode ? selectedNode.data.label : "No node selected"}
        </p>
        <p className="mt-1 text-[13px] text-text-secondary">
          {selectedNode ? selectedConfig?.label : "Pick a step to edit."}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 pb-3">
        {selectedNode ? (
          <NodeFormPanel node={selectedNode} />
        ) : (
          <div className="flex h-full flex-col gap-2 pb-2">
            <EmptyState
              description="Click any step in the canvas."
              Icon={PanelRightOpen}
              title="Node settings"
            />

            <div className="grid gap-2">
              <div className="rounded-[22px] border border-border-default bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-[var(--color-accent)]" />
                  <p className="text-sm font-semibold text-text-primary">Live edit</p>
                </div>
                <p className="mt-1.5 text-sm text-text-secondary">Select, edit, and validate.</p>
              </div>

              <div className="rounded-[22px] border border-border-default bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[var(--color-node-automated)]" />
                  <p className="text-sm font-semibold text-text-primary">Snapshots</p>
                </div>
                <p className="mt-1.5 text-sm text-text-secondary">Restore prior node states.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
