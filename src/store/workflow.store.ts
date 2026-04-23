"use client";

import { createId, getNodeLabel } from "@lib/utils";
import { validateWorkflowGraph } from "@lib/workflow-validator";
import type {
  NodeData,
  NodeType,
  NodeVersion,
  ValidationResult,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
} from "@types-app/workflow.types";
import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { debounce } from "es-toolkit";
import { current, isDraft } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const HISTORY_LIMIT = 50;
const NODE_HISTORY_LIMIT = 10;

interface HistorySnapshot {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface ReplaceGraphOptions {
  markDirty?: boolean | undefined;
  preserveSelection?: boolean | undefined;
  recordHistory?: boolean | undefined;
}

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  isSimulationOpen: boolean;
  isSaving: boolean;
  isSaved: boolean;
  isDirty: boolean;
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  workflowVersion: number;
  sidebarTab: "nodes" | "saved";
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  nodeVersionHistory: Record<string, NodeVersion[]>;
  validationResult: ValidationResult;
  clearCanvas: () => void;
  connectNodes: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  loadWorkflow: (workflow: {
    description: string;
    graph: WorkflowGraph;
    id?: string | null | undefined;
    name: string;
    nodeVersionHistory?: Record<string, NodeVersion[]> | undefined;
    version?: number | undefined;
  }) => void;
  markSaved: (id: string, version: number) => void;
  markSaving: (value: boolean) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  redo: () => void;
  removeEdge: (edgeId: string) => void;
  removeNode: (nodeId: string) => void;
  replaceGraph: (graph: WorkflowGraph, options?: ReplaceGraphOptions) => void;
  resetWorkflow: () => void;
  restoreNodeVersion: (nodeId: string, versionId: string) => void;
  runValidation: () => void;
  selectNode: (nodeId: string | null) => void;
  setSidebarTab: (tab: "nodes" | "saved") => void;
  setSimulationOpen: (value: boolean) => void;
  setWorkflowMeta: (name: string, description: string) => void;
  undo: () => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
}

const DEFAULT_NODE_DATA: Record<NodeType, NodeData> = {
  startNode: {
    nodeType: "startNode",
    label: "Start",
    metadata: [],
  },
  taskNode: {
    nodeType: "taskNode",
    label: "New Task",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "medium",
    customFields: [],
  },
  approvalNode: {
    nodeType: "approvalNode",
    label: "Approval",
    approverRole: "Manager",
    autoApproveThreshold: 50,
    requireAllApprovers: false,
    timeoutHours: 48,
  },
  automatedStepNode: {
    nodeType: "automatedStepNode",
    label: "Automation",
    actionId: "",
    actionParams: {},
  },
  endNode: {
    nodeType: "endNode",
    label: "End",
    endMessage: "Workflow completed successfully.",
    showSummary: true,
    outcomeType: "success",
  },
};

function toPlainValue<T>(value: T): T {
  return isDraft(value) ? current(value) : value;
}

function cloneGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): HistorySnapshot {
  return {
    nodes: structuredClone(toPlainValue(nodes)),
    edges: structuredClone(toPlainValue(edges)),
  };
}

function cloneNodeData<T extends NodeData>(data: T): T {
  return structuredClone(toPlainValue(data));
}

function buildEdge(connection: Connection): WorkflowEdge {
  return {
    id: createId("edge"),
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? null,
    targetHandle: connection.targetHandle ?? null,
    type: "default",
    animated: false,
    data: {},
  };
}

function syncHistoryFlags(store: Pick<WorkflowStore, "canRedo" | "canUndo" | "future" | "past">) {
  store.canUndo = store.past.length > 0;
  store.canRedo = store.future.length > 0;
}

function createInitialState(): Pick<
  WorkflowStore,
  | "canRedo"
  | "canUndo"
  | "edges"
  | "future"
  | "isDirty"
  | "isSaved"
  | "isSaving"
  | "isSimulationOpen"
  | "nodeVersionHistory"
  | "nodes"
  | "past"
  | "selectedNodeId"
  | "sidebarTab"
  | "validationResult"
  | "workflowDescription"
  | "workflowId"
  | "workflowName"
  | "workflowVersion"
> {
  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    isSimulationOpen: false,
    isSaving: false,
    isSaved: false,
    isDirty: false,
    workflowId: null,
    workflowName: "Untitled Workflow",
    workflowDescription: "",
    workflowVersion: 1,
    sidebarTab: "nodes",
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
    nodeVersionHistory: {},
    validationResult: validateWorkflowGraph({ nodes: [], edges: [] }),
  };
}

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    immer((set, get) => {
      const scheduleValidation = debounce(() => {
        const { edges, nodes } = get();
        set((state) => {
          state.validationResult = validateWorkflowGraph({ nodes, edges });
        });
      }, 300);

      const pushHistory = (state: WorkflowStore) => {
        state.past.push(cloneGraph(state.nodes, state.edges));
        if (state.past.length > HISTORY_LIMIT) {
          state.past.shift();
        }
        state.future = [];
        syncHistoryFlags(state);
      };

      return {
        ...createInitialState(),
        addNode: (type, position) => {
          set((state) => {
            pushHistory(state);
            state.nodes.push({
              id: createId(type),
              type,
              position,
              data: cloneNodeData(DEFAULT_NODE_DATA[type]),
            });
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        clearCanvas: () => {
          set((state) => {
            pushHistory(state);
            state.nodes = [];
            state.edges = [];
            state.selectedNodeId = null;
            state.nodeVersionHistory = {};
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        connectNodes: (connection) => {
          if (!connection.source || !connection.target) {
            return;
          }

          set((state) => {
            pushHistory(state);
            state.edges = addEdge(buildEdge(connection), state.edges) as WorkflowEdge[];
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        loadWorkflow: (workflow) => {
          set((state) => {
            state.nodes = structuredClone(workflow.graph.nodes);
            state.edges = structuredClone(workflow.graph.edges);
            state.workflowId = workflow.id ?? null;
            state.workflowName = workflow.name;
            state.workflowDescription = workflow.description;
            state.workflowVersion = workflow.version ?? 1;
            state.selectedNodeId = null;
            state.nodeVersionHistory = structuredClone(workflow.nodeVersionHistory ?? {});
            state.past = [];
            state.future = [];
            state.isDirty = false;
            state.isSaved = Boolean(workflow.id);
            state.validationResult = validateWorkflowGraph(workflow.graph);
            syncHistoryFlags(state);
          });
        },
        markSaved: (id, version) => {
          set((state) => {
            state.workflowId = id;
            state.workflowVersion = version;
            state.isSaving = false;
            state.isSaved = true;
            state.isDirty = false;
          });
        },
        markSaving: (value) => {
          set((state) => {
            state.isSaving = value;
          });
        },
        onEdgesChange: (changes) => {
          set((state) => {
            const shouldRecord = changes.some((change) => change.type === "remove");
            if (shouldRecord) {
              pushHistory(state);
            }
            state.edges = applyEdgeChanges(changes, state.edges) as WorkflowEdge[];
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        onNodesChange: (changes) => {
          set((state) => {
            const shouldRecord = changes.some(
              (change) =>
                change.type === "remove" ||
                (change.type === "position" && change.dragging === false),
            );
            if (shouldRecord) {
              pushHistory(state);
            }
            state.nodes = applyNodeChanges(changes, state.nodes) as WorkflowNode[];
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        redo: () => {
          set((state) => {
            const next = state.future.shift();
            if (!next) {
              return;
            }
            state.past.push(cloneGraph(state.nodes, state.edges));
            state.nodes = next.nodes;
            state.edges = next.edges;
            syncHistoryFlags(state);
          });
          scheduleValidation();
        },
        removeEdge: (edgeId) => {
          set((state) => {
            pushHistory(state);
            state.edges = state.edges.filter((edge) => edge.id !== edgeId);
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        removeNode: (nodeId) => {
          set((state) => {
            pushHistory(state);
            state.nodes = state.nodes.filter((node) => node.id !== nodeId);
            state.edges = state.edges.filter(
              (edge) => edge.source !== nodeId && edge.target !== nodeId,
            );
            if (state.selectedNodeId === nodeId) {
              state.selectedNodeId = null;
            }
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        replaceGraph: (graph, options) => {
          set((state) => {
            if (options?.recordHistory ?? true) {
              pushHistory(state);
            }
            state.nodes = structuredClone(graph.nodes);
            state.edges = structuredClone(graph.edges);
            if (!(options?.preserveSelection ?? false)) {
              state.selectedNodeId = null;
            }
            state.isDirty = options?.markDirty ?? true;
            if (options?.markDirty ?? true) {
              state.isSaved = false;
            }
          });
          scheduleValidation();
        },
        resetWorkflow: () => {
          set((state) => {
            Object.assign(state, createInitialState());
          });
        },
        restoreNodeVersion: (nodeId, versionId) => {
          set((state) => {
            const version = state.nodeVersionHistory[nodeId]?.find(
              (entry) => entry.id === versionId,
            );
            const node = state.nodes.find((entry) => entry.id === nodeId);
            if (!version || !node) {
              return;
            }
            node.data = cloneNodeData(version.data);
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
        runValidation: () => {
          const { edges, nodes } = get();
          set((state) => {
            state.validationResult = validateWorkflowGraph({ nodes, edges });
          });
        },
        selectNode: (nodeId) => {
          set((state) => {
            state.selectedNodeId = nodeId;
          });
        },
        setSidebarTab: (tab) => {
          set((state) => {
            state.sidebarTab = tab;
          });
        },
        setSimulationOpen: (value) => {
          set((state) => {
            state.isSimulationOpen = value;
          });
        },
        setWorkflowMeta: (name, description) => {
          set((state) => {
            state.workflowName = name;
            state.workflowDescription = description;
            state.isDirty = true;
            state.isSaved = false;
          });
        },
        undo: () => {
          set((state) => {
            const previous = state.past.pop();
            if (!previous) {
              return;
            }
            state.future.unshift(cloneGraph(state.nodes, state.edges));
            state.nodes = previous.nodes;
            state.edges = previous.edges;
            syncHistoryFlags(state);
          });
          scheduleValidation();
        },
        updateNodeData: (nodeId, data) => {
          set((state) => {
            const node = state.nodes.find((entry) => entry.id === nodeId);
            if (!node) {
              return;
            }

            const currentHistory = state.nodeVersionHistory[nodeId] ?? [];
            state.nodeVersionHistory[nodeId] = [
              {
                id: createId("local-version"),
                workflowId: state.workflowId ?? "__session__",
                nodeId,
                nodeType: node.type,
                data: cloneNodeData(node.data),
                label: getNodeLabel(node.data),
                createdAt: new Date().toISOString(),
              },
              ...currentHistory,
            ].slice(0, NODE_HISTORY_LIMIT);

            node.data = { ...node.data, ...data } as NodeData;
            state.isDirty = true;
            state.isSaved = false;
          });
          scheduleValidation();
        },
      };
    }),
    { name: "NexusFlowStore" },
  ),
);
