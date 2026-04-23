"use client";

import { useEffect } from "react";

import { useWorkflowStore } from "./use-workflow-store";

interface KeyboardShortcutOptions {
  applyLayout: (direction: "LR" | "TB") => void;
  handleExport: () => void;
  handleSave: () => void;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function useKeyboardShortcuts({
  applyLayout,
  handleExport,
  handleSave,
}: KeyboardShortcutOptions) {
  const isSimulationOpen = useWorkflowStore((state) => state.isSimulationOpen);
  const redo = useWorkflowStore((state) => state.redo);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const setSimulationOpen = useWorkflowStore((state) => state.setSimulationOpen);
  const undo = useWorkflowStore((state) => state.undo);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const editable = isEditableTarget(event.target);
      const withCommand = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (editable && !withCommand && key !== "escape") {
        return;
      }

      if (withCommand && key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if ((withCommand && key === "y") || (withCommand && event.shiftKey && key === "z")) {
        event.preventDefault();
        redo();
        return;
      }

      if (withCommand && key === "s") {
        event.preventDefault();
        handleSave();
        return;
      }

      if (withCommand && key === "e") {
        event.preventDefault();
        handleExport();
        return;
      }

      if (withCommand && key === "l" && event.shiftKey) {
        event.preventDefault();
        applyLayout("LR");
        return;
      }

      if (withCommand && key === "l") {
        event.preventDefault();
        applyLayout("TB");
        return;
      }

      if ((key === "delete" || key === "backspace") && selectedNodeId) {
        event.preventDefault();
        removeNode(selectedNodeId);
        return;
      }

      if (key === "escape") {
        event.preventDefault();
        selectNode(null);
        if (isSimulationOpen) {
          setSimulationOpen(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    applyLayout,
    handleExport,
    handleSave,
    isSimulationOpen,
    redo,
    removeNode,
    selectNode,
    selectedNodeId,
    setSimulationOpen,
    undo,
  ]);
}
