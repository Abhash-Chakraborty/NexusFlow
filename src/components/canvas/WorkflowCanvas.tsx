"use client";

import { ApprovalNode, AutomatedStepNode, EndNode, StartNode, TaskNode } from "@components/nodes";
import { NODE_TYPE_CONFIGS } from "@constants/node-config";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import type { NodeType, WorkflowEdge, WorkflowNode } from "@types-app/workflow.types";
import {
  Background,
  BackgroundVariant,
  type Connection,
  ControlButton,
  Controls,
  type EdgeTypes,
  MiniMap,
  type NodeTypes,
  Panel,
  ReactFlow,
  type ReactFlowInstance,
  ReactFlowProvider,
} from "@xyflow/react";
import { Expand, Minimize } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ConnectionLine } from "./ConnectionLine";
import { CustomEdge } from "./CustomEdge";

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedStepNode: AutomatedStepNode,
  endNode: EndNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

function WorkflowCanvasInner() {
  const canvasShellRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimapHovered, setIsMinimapHovered] = useState(false);
  const [isMinimapCondensed, setIsMinimapCondensed] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    WorkflowNode,
    WorkflowEdge
  > | null>(null);
  const addNode = useWorkflowStore((state) => state.addNode);
  const connectNodes = useWorkflowStore((state) => state.connectNodes);
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const selectNode = useWorkflowStore((state) => state.selectNode);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const graphSignature = useMemo(() => {
    const nodeKey = nodes
      .map((node) => `${node.id}:${node.type}`)
      .sort()
      .join("|");
    const edgeKey = edges
      .map((edge) => `${edge.id}:${edge.source}:${edge.target}:${edge.sourceHandle ?? ""}`)
      .sort()
      .join("|");
    return `${nodeKey}::${edgeKey}`;
  }, [edges, nodes]);

  const isValidConnection = useCallback(
    (connection: Connection | WorkflowEdge) => {
      if (!connection.source || !connection.target) {
        return false;
      }

      if (connection.source === connection.target) {
        return false;
      }

      const sourceNode = nodeMap.get(connection.source);
      const targetNode = nodeMap.get(connection.target);
      if (!sourceNode || !targetNode) {
        return false;
      }

      if (sourceNode.type === "endNode" || targetNode.type === "startNode") {
        return false;
      }

      const duplicateEdge = edges.some(
        (edge) => edge.source === connection.source && edge.target === connection.target,
      );
      if (duplicateEdge) {
        return false;
      }

      if (sourceNode.type === "approvalNode") {
        const outgoingCount = edges.filter((edge) => edge.source === sourceNode.id).length;
        if (outgoingCount >= 2) {
          return false;
        }
      }

      return true;
    },
    [edges, nodeMap],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) {
        return;
      }
      connectNodes(connection);
    },
    [connectNodes, isValidConnection],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = (event.dataTransfer.getData("application/nexusflow-node") ||
        event.dataTransfer.getData("text/plain")) as NodeType;
      if (!nodeType || !reactFlowInstance) {
        return;
      }

      addNode(
        nodeType,
        reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
      );
    },
    [addNode, reactFlowInstance],
  );

  const toggleFullscreen = useCallback(async () => {
    const canvasElement = canvasShellRef.current;
    if (!canvasElement) {
      return;
    }

    if (document.fullscreenElement === canvasElement) {
      await document.exitFullscreen();
      return;
    }

    await canvasElement.requestFullscreen();
  }, []);

  useEffect(() => {
    if (!reactFlowInstance || graphSignature.length === 2 || nodes.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      reactFlowInstance.fitView({ duration: 300, padding: 0.18 });
    }, 40);

    return () => window.clearTimeout(timer);
  }, [graphSignature, nodes.length, reactFlowInstance]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === canvasShellRef.current;
      setIsFullscreen(active);
      if (active && reactFlowInstance) {
        window.setTimeout(() => {
          reactFlowInstance.fitView({ duration: 250, padding: 0.18 });
        }, 60);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [reactFlowInstance]);

  useEffect(() => {
    if (isMinimapHovered) {
      setIsMinimapCondensed(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsMinimapCondensed(true);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [isMinimapHovered]);

  return (
    <div
      ref={canvasShellRef}
      className="surface-card relative h-full min-h-[460px] overflow-hidden rounded-[32px] p-2"
      data-tour-id="workflow-canvas"
    >
      <div
        className="canvas-dot-grid h-full w-full overflow-hidden rounded-[26px] border border-border-subtle"
        data-nexusflow-canvas="true"
      >
        <ReactFlow<WorkflowNode, WorkflowEdge>
          connectionLineComponent={ConnectionLine}
          connectionRadius={30}
          defaultEdgeOptions={{ type: "default", animated: false }}
          deleteKeyCode={["Backspace", "Delete"]}
          edgeTypes={edgeTypes}
          edges={edges}
          elevateEdgesOnSelect
          fitView
          fitViewOptions={{ padding: 0.2 }}
          isValidConnection={isValidConnection}
          maxZoom={2}
          minZoom={0.2}
          multiSelectionKeyCode="Shift"
          nodeTypes={nodeTypes}
          nodes={nodes}
          proOptions={{ hideAttribution: true }}
          selectionKeyCode="Shift"
          snapGrid={[12, 12]}
          snapToGrid
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onEdgesChange={onEdgesChange}
          onInit={setReactFlowInstance}
          onNodeClick={(_, node) => selectNode(node.id)}
          onNodesChange={onNodesChange}
          onPaneClick={() => selectNode(null)}
        >
          <Panel position="top-left">
            <div className="pointer-events-none px-2 py-1">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary">
                  Canvas
                </span>
                <span className="h-1 w-1 rounded-full bg-border-strong" />
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
                  {nodes.length} nodes
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-text-muted">
                Drag a step. Click to edit.
              </p>
            </div>
          </Panel>

          <Background
            color="var(--color-canvas-dot)"
            gap={20}
            size={1.8}
            variant={BackgroundVariant.Dots}
          />
          <Controls position="bottom-right" showInteractive={false}>
            <ControlButton
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </ControlButton>
          </Controls>
          <Panel position="bottom-left">
            <button
              aria-label="Canvas navigator"
              className={`pointer-events-auto absolute bottom-0 left-0 appearance-none overflow-hidden rounded-[16px] border border-border-default bg-transparent p-0 shadow-[var(--shadow-panel)] backdrop-blur transition-all duration-300 ${
                isMinimapCondensed ? "h-[44px] w-[44px]" : "h-[188px] w-[248px]"
              }`}
              type="button"
              onFocus={() => setIsMinimapHovered(true)}
              onBlur={() => setIsMinimapHovered(false)}
              onMouseEnter={() => setIsMinimapHovered(true)}
              onMouseLeave={() => setIsMinimapHovered(false)}
            >
              <div className="h-full w-full overflow-hidden rounded-[15px] bg-transparent">
                <MiniMap
                  maskColor="var(--color-minimap-mask)"
                  nodeColor={(node) =>
                    NODE_TYPE_CONFIGS[node.type as NodeType]?.colorHex ?? "var(--color-accent)"
                  }
                  offsetScale={0}
                  pannable
                  position="bottom-left"
                  zoomable
                />
              </div>
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
