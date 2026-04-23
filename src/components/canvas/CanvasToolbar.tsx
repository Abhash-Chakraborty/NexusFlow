"use client";

import { useWorkflowStore } from "@hooks/use-workflow-store";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Kbd } from "@ui/kbd";
import {
  Download,
  Eraser,
  LayoutPanelTop,
  Play,
  Redo2,
  RefreshCw,
  Save,
  Undo2,
  Upload,
  Wand2,
} from "lucide-react";

interface CanvasToolbarProps {
  onClearCanvas: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onLayoutHorizontal: () => void;
  onLayoutVertical: () => void;
  onNewWorkflow: () => void;
  onOpenSimulation: () => void;
  onSave: () => void;
}

export function CanvasToolbar({
  onClearCanvas,
  onExport,
  onImportClick,
  onLayoutHorizontal,
  onLayoutVertical,
  onNewWorkflow,
  onOpenSimulation,
  onSave,
}: CanvasToolbarProps) {
  const canRedo = useWorkflowStore((state) => state.canRedo);
  const canUndo = useWorkflowStore((state) => state.canUndo);
  const hasCanvasContent = useWorkflowStore(
    (state) => state.nodes.length > 0 || state.edges.length > 0,
  );
  const redo = useWorkflowStore((state) => state.redo);
  const undo = useWorkflowStore((state) => state.undo);
  const workflowDescription = useWorkflowStore((state) => state.workflowDescription);
  const workflowName = useWorkflowStore((state) => state.workflowName);
  const setWorkflowMeta = useWorkflowStore((state) => state.setWorkflowMeta);

  return (
    <div className="surface-card toolbar-shell rounded-[28px] px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="rounded-[22px] bg-black px-4 py-2 text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2">
            <p className="font-display text-[1.45rem] font-semibold tracking-[-0.05em]">
              NexusFlow
            </p>
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/90">
              V1
            </span>
          </div>
        </div>
      </div>

      <div className="toolbar-fields min-w-0">
        <Input
          className="h-9 font-medium"
          placeholder="Flow name"
          value={workflowName}
          onChange={(event) => setWorkflowMeta(event.target.value, workflowDescription)}
        />
      </div>

      <div className="toolbar-actions">
        <div className="flex items-center gap-1 rounded-full border border-border-default bg-white p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <Button size="sm" type="button" variant="ghost" onClick={onNewWorkflow}>
            <RefreshCw className="h-4 w-4" />
            New
          </Button>
          <Button
            disabled={!hasCanvasContent}
            size="sm"
            type="button"
            variant="ghost"
            onClick={onClearCanvas}
          >
            <Eraser className="h-4 w-4" />
            Clear
          </Button>
          <Button disabled={!canUndo} size="icon" type="button" variant="ghost" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button disabled={!canRedo} size="icon" type="button" variant="ghost" onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border-default bg-white p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <Button size="sm" type="button" variant="ghost" onClick={onLayoutVertical}>
            <LayoutPanelTop className="h-4 w-4" />
            Vertical
            <Kbd className="hidden 2xl:inline-flex">Ctrl+L</Kbd>
          </Button>
          <Button size="sm" type="button" variant="ghost" onClick={onLayoutHorizontal}>
            <Wand2 className="h-4 w-4" />
            Horizontal
          </Button>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border-default bg-white p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <Button size="sm" type="button" variant="ghost" onClick={onImportClick}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" type="button" variant="ghost" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <Button size="sm" type="button" variant="outline" onClick={onOpenSimulation}>
          <Play className="h-4 w-4" />
          Run
        </Button>
        <Button size="sm" type="button" variant="primary" onClick={onSave}>
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
