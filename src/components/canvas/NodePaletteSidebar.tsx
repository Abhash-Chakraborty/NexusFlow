"use client";

import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { WORKFLOW_TEMPLATES } from "@constants/templates";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Bot,
  BriefcaseBusiness,
  ClipboardList,
  DatabaseZap,
  FileCheck2,
  FileStack,
  FolderInput,
  HeartPulse,
  LayoutGrid,
  Library,
  PlayCircle,
  Shapes,
  ShieldAlert,
} from "lucide-react";

import { WorkflowListSidebar } from "./WorkflowListSidebar";

const templateIconMap = [
  PlayCircle,
  FolderInput,
  FileCheck2,
  DatabaseZap,
  BriefcaseBusiness,
  ShieldAlert,
  HeartPulse,
  ClipboardList,
];

export function NodePaletteSidebar() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow);
  const nodes = useWorkflowStore((state) => state.nodes);
  const sidebarTab = useWorkflowStore((state) => state.sidebarTab);
  const setSidebarTab = useWorkflowStore((state) => state.setSidebarTab);

  return (
    <aside
      className="surface-card flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[30px] p-2.5"
      data-tour-id="left-rail"
    >
      <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-full bg-surface-2 p-1">
        <Button
          className="w-full"
          size="sm"
          type="button"
          variant={sidebarTab === "nodes" ? "primary" : "ghost"}
          onClick={() => setSidebarTab("nodes")}
        >
          <Shapes className="h-4 w-4" />
          Nodes
        </Button>
        <Button
          className="w-full"
          size="sm"
          type="button"
          variant={sidebarTab === "saved" ? "primary" : "ghost"}
          onClick={() => setSidebarTab("saved")}
        >
          <Library className="h-4 w-4" />
          Saved
        </Button>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-0.5">
        {sidebarTab === "nodes" ? (
          <div className="space-y-3 pb-2">
            <section className="space-y-1.5" data-tour-id="node-palette">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mono-label">Library</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <LayoutGrid className="h-4 w-4" />
                    Node palette
                  </p>
                </div>
                <Badge tone="muted">Drag</Badge>
              </div>

              {Object.values(NODE_TYPE_CONFIGS).map((config) => {
                const Icon = config.icon;
                return (
                  <button
                    key={config.type}
                    className="group flex w-full cursor-grab items-center gap-2.5 rounded-[22px] border border-border-default bg-surface-0 p-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-panel)]"
                    draggable
                    type="button"
                    onClick={() =>
                      addNode(config.type, {
                        x: 180 + (nodes.length % 3) * 220,
                        y: 140 + Math.floor(nodes.length / 3) * 140,
                      })
                    }
                    onDragStart={(event) => {
                      event.dataTransfer.setData("application/nexusflow-node", config.type);
                      event.dataTransfer.setData("text/plain", config.type);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    <div
                      className="rounded-full border border-black/6 bg-surface-2 p-2.5 transition group-hover:scale-105"
                      style={{ color: config.colorHex }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold tracking-[-0.02em] text-text-primary">
                        {config.label}
                      </p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.12em] text-text-muted">
                        {config.outputLabels?.length
                          ? `${config.outputLabels.length} exits`
                          : `${config.outputHandles} out`}
                      </p>
                    </div>
                    <Badge className="hidden xl:inline-flex" tone="muted">
                      {config.inputHandles}/{config.outputHandles}
                    </Badge>
                  </button>
                );
              })}
            </section>

            <section className="space-y-1.5" data-tour-id="starter-workflows">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mono-label">Starters</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <FileStack className="h-4 w-4" />
                    Starter workflows
                  </p>
                </div>
              </div>

              {WORKFLOW_TEMPLATES.map((template, index) => {
                const Icon = templateIconMap[index] ?? Bot;
                return (
                  <button
                    key={template.name}
                    className="w-full rounded-[22px] border border-border-default bg-surface-0 p-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-panel)]"
                    type="button"
                    onClick={() =>
                      loadWorkflow({
                        id: null,
                        name: template.name,
                        description: template.description,
                        graph: template.graph,
                        version: 1,
                      })
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-full border border-black/6 bg-surface-2 p-2.5 text-text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-[-0.02em] text-text-primary">
                          {template.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-muted">
                          {template.graph.nodes.length} steps
                        </p>
                      </div>
                      <PlayCircle className="h-4 w-4 text-text-muted" />
                    </div>
                  </button>
                );
              })}
            </section>
          </div>
        ) : (
          <WorkflowListSidebar />
        )}
      </div>
    </aside>
  );
}
