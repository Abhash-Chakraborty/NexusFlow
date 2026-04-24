"use client";

import { useToast } from "@components/providers/ToastProvider";
import { useAutoLayout } from "@hooks/use-auto-layout";
import { useKeyboardShortcuts } from "@hooks/use-keyboard-shortcuts";
import { useSaveWorkflow } from "@hooks/use-saved-workflows";
import { useWorkflowExport } from "@hooks/use-workflow-export";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import { useEffect, useRef } from "react";

import { CanvasToolbar } from "./CanvasToolbar";
import { ConfigPanel } from "./ConfigPanel";
import { NodePaletteSidebar } from "./NodePaletteSidebar";
import { OnboardingTour } from "./OnboardingTour";
import { SimulationPanel } from "./SimulationPanel";
import { StatusBar } from "./StatusBar";
import { WorkflowCanvas } from "./WorkflowCanvas";

const WORKFLOW_DRAFT_STORAGE_KEY = "nexusflow:designer-draft";

export function DesignerShell() {
  const clearCanvas = useWorkflowStore((state) => state.clearCanvas);
  const edges = useWorkflowStore((state) => state.edges);
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow);
  const markSaved = useWorkflowStore((state) => state.markSaved);
  const markSaving = useWorkflowStore((state) => state.markSaving);
  const nodes = useWorkflowStore((state) => state.nodes);
  const nodeVersionHistory = useWorkflowStore((state) => state.nodeVersionHistory);
  const setSimulationOpen = useWorkflowStore((state) => state.setSimulationOpen);
  const workflowDescription = useWorkflowStore((state) => state.workflowDescription);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const workflowName = useWorkflowStore((state) => state.workflowName);
  const workflowVersion = useWorkflowStore((state) => state.workflowVersion);

  const { applyLayout } = useAutoLayout();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasHydratedDraftRef = useRef(false);
  const saveWorkflow = useSaveWorkflow();
  const { exportWorkflow, importWorkflow } = useWorkflowExport();
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(WORKFLOW_DRAFT_STORAGE_KEY);
      if (!storedDraft) {
        hasHydratedDraftRef.current = true;
        return;
      }

      const parsedDraft = JSON.parse(storedDraft) as {
        description: string;
        graph: { edges: typeof edges; nodes: typeof nodes };
        id?: string | null;
        name: string;
        nodeVersionHistory?: typeof nodeVersionHistory;
        version?: number;
      };

      if (
        !Array.isArray(parsedDraft?.graph?.nodes) ||
        !Array.isArray(parsedDraft?.graph?.edges) ||
        !parsedDraft?.name
      ) {
        hasHydratedDraftRef.current = true;
        return;
      }

      loadWorkflow({
        id: parsedDraft.id ?? null,
        name: parsedDraft.name,
        nodeVersionHistory: parsedDraft.nodeVersionHistory ?? {},
        description: parsedDraft.description ?? "",
        graph: parsedDraft.graph,
        version: parsedDraft.version ?? 1,
      });
    } catch {
      window.localStorage.removeItem(WORKFLOW_DRAFT_STORAGE_KEY);
    } finally {
      hasHydratedDraftRef.current = true;
    }
  }, [loadWorkflow]);

  useEffect(() => {
    if (!hasHydratedDraftRef.current) {
      return;
    }

    window.localStorage.setItem(
      WORKFLOW_DRAFT_STORAGE_KEY,
      JSON.stringify({
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        nodeVersionHistory,
        version: workflowVersion,
        graph: { nodes, edges },
      }),
    );
  }, [
    edges,
    nodeVersionHistory,
    nodes,
    workflowDescription,
    workflowId,
    workflowName,
    workflowVersion,
  ]);

  const handleSave = async () => {
    try {
      markSaving(true);
      const workflow = await saveWorkflow.mutateAsync({
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        graph: { nodes, edges },
        expectedVersion: workflowVersion,
      });
      markSaved(workflow.id, workflow.version);
      showToast({
        tone: "success",
        title: "Workflow saved",
        description: `${workflow.name} is now persisted.`,
      });
    } catch (error) {
      markSaving(false);
      showToast({
        tone: "error",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save workflow",
      });
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const workflow = await importWorkflow(file);
      showToast({
        tone: "success",
        title: "Workflow imported",
        description: workflow.name,
      });
    } catch (error) {
      showToast({
        tone: "error",
        title: "Import failed",
        description: error instanceof Error ? error.message : "Could not import workflow",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleNewWorkflow = () => {
    loadWorkflow({
      id: null,
      name: "Untitled Workflow",
      description: "",
      graph: { nodes: [], edges: [] },
      version: 1,
    });
  };

  const handleClearCanvas = () => {
    clearCanvas();
    showToast({
      tone: "success",
      title: "Canvas cleared",
      description: "Your workflow metadata was kept, and the graph was reset.",
    });
  };

  useKeyboardShortcuts({
    applyLayout,
    handleExport: exportWorkflow,
    handleSave,
  });

  return (
    <>
      <div className="relative min-h-screen bg-app text-text-primary lg:h-[100dvh] lg:overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[20rem] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-surface-0)_72%,transparent),transparent_68%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-10 h-[18rem] w-[18rem] rounded-full bg-[rgba(163,255,91,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-[-2rem] h-[20rem] w-[20rem] rounded-full bg-[rgba(248,100,214,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute left-[38%] top-8 h-[16rem] w-[16rem] rounded-full bg-[rgba(132,94,247,0.12)] blur-3xl" />

        <div className="relative grid min-h-screen w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-[6px] p-[10px] lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-[10px]">
          <CanvasToolbar
            onClearCanvas={handleClearCanvas}
            onExport={exportWorkflow}
            onImportClick={() => fileInputRef.current?.click()}
            onLayoutHorizontal={() => applyLayout("LR")}
            onLayoutVertical={() => applyLayout("TB")}
            onNewWorkflow={handleNewWorkflow}
            onOpenSimulation={() => setSimulationOpen(true)}
            onSave={handleSave}
          />

          <div className="designer-workspace min-h-0">
            <div className="viewport-panel min-h-[320px] lg:min-h-0">
              <NodePaletteSidebar />
            </div>
            <div className="viewport-panel min-h-[460px] min-w-0 lg:min-h-0">
              <WorkflowCanvas />
            </div>
            <div className="viewport-panel min-h-[320px] lg:min-h-0">
              <ConfigPanel />
            </div>
          </div>

          <StatusBar />
        </div>
      </div>

      <OnboardingTour />
      <SimulationPanel />

      <input
        ref={fileInputRef}
        accept="application/json"
        className="hidden"
        type="file"
        onChange={handleImportFile}
      />
    </>
  );
}
