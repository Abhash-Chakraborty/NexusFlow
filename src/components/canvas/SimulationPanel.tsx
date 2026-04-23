"use client";

import { ExecutionTimeline } from "@components/simulation/ExecutionTimeline";
import { SimulationLog } from "@components/simulation/SimulationLog";

import { useSimulation } from "@hooks/use-simulation";
import { useWorkflowStore } from "@hooks/use-workflow-store";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Play, RotateCcw, X } from "lucide-react";

export function SimulationPanel() {
  const edges = useWorkflowStore((state) => state.edges);
  const isSimulationOpen = useWorkflowStore((state) => state.isSimulationOpen);
  const nodes = useWorkflowStore((state) => state.nodes);
  const setSimulationOpen = useWorkflowStore((state) => state.setSimulationOpen);
  const validationResult = useWorkflowStore((state) => state.validationResult);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const simulation = useSimulation();

  const errorCount = validationResult.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = validationResult.issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  const runSimulation = () => {
    simulation.clearResult();
    simulation.mutate({
      workflowId: workflowId ?? undefined,
      graph: { nodes, edges },
      force: false,
    });
  };

  return (
    <AnimatePresence>
      {isSimulationOpen ? (
        <>
          <motion.button
            aria-label="Close simulation overlay"
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-[rgba(16,24,40,0.22)] backdrop-blur-[10px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            type="button"
            onClick={() => setSimulationOpen(false)}
          />

          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-5"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative flex h-[min(82vh,760px)] w-full max-w-[1440px] flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[rgba(255,255,255,0.96)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
              exit={{ opacity: 0, scale: 0.98, y: 24 }}
              initial={{ opacity: 0, scale: 0.98, y: 24 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_72%)]" />

              <div className="relative flex h-full flex-col px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                <div className="flex items-center justify-between gap-4 border-b border-border-default pb-4">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">Workflow Simulator</p>
                    <p className="text-sm text-text-secondary">
                      {simulation.result?.executionId
                        ? `Execution ${simulation.result.executionId}`
                        : "Serialize the validated workflow graph and preview the mock execution log."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {simulation.result ? (
                      <Button size="sm" type="button" variant="subtle" onClick={runSimulation}>
                        <RotateCcw className="h-4 w-4" />
                        Re-run
                      </Button>
                    ) : null}
                    <Button
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setSimulationOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="rounded-[20px] border border-border-default bg-white/90 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-text-primary">
                          Validation Summary
                        </p>
                        <AlertCircle className="h-4 w-4 text-text-secondary" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone={errorCount > 0 ? "error" : "success"}>
                          {errorCount} errors
                        </Badge>
                        <Badge tone={warningCount > 0 ? "warning" : "accent"}>
                          {warningCount} warnings
                        </Badge>
                      </div>
                      <div className="mt-4 max-h-[220px] space-y-2 overflow-y-auto pr-1">
                        {validationResult.issues.map((issue, index) => (
                          <div
                            key={`${issue.code}-${index}`}
                            className="rounded-[14px] bg-surface-2 px-3 py-2"
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                              {issue.severity}
                            </p>
                            <p className="mt-1 text-sm text-text-primary">{issue.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={
                        !validationResult.isValid || nodes.length === 0 || simulation.isPending
                      }
                      type="button"
                      variant="primary"
                      onClick={runSimulation}
                    >
                      {simulation.isPending ? (
                        <Spinner className="text-white" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Run Simulation
                    </Button>
                  </div>

                  <div className="min-h-0 overflow-y-auto rounded-[20px] border border-border-default bg-white/92 p-4 shadow-sm">
                    {simulation.result ? (
                      <div className="space-y-4">
                        <ExecutionTimeline steps={simulation.result.steps} />
                        <SimulationLog steps={simulation.result.steps} />
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-sm text-text-secondary">
                        <p>
                          Simulation results appear here after the workflow passes validation and
                          runs.
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-text-muted">
                          This matches the case-study sandbox panel: validate, serialize, simulate.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
