import dagre from "@dagrejs/dagre";

import type { WorkflowGraph, WorkflowNode } from "@types-app/workflow.types";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 154;

export function applyAutoLayout(
  graph: WorkflowGraph,
  direction: "LR" | "TB" = "TB",
): WorkflowNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 100,
    nodesep: 60,
    marginx: 40,
    marginy: 40,
  });

  for (const node of graph.nodes) {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of graph.edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  return graph.nodes.map((node) => {
    const position = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    };
  });
}
