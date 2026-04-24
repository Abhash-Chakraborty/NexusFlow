"use client";

import { Button } from "@ui/button";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ONBOARDING_STORAGE_KEY = "nexusflow:onboarding-tour:v1";
const SPOTLIGHT_PADDING = 12;
const TOOLTIP_WIDTH = 320;

type TourPlacement = "bottom" | "left" | "right" | "top";

interface TourStep {
  content: string;
  placement?: TourPlacement;
  selector: string;
  title: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour-id="workflow-name"]',
    title: "Name your workflow",
    content:
      "This is your workflow title. Keep it short and specific so saved flows stay easy to spot later.",
    placement: "bottom",
  },
  {
    selector: '[data-tour-id="new-workflow"]',
    title: "Start fresh or clear the graph",
    content:
      "Use New for a fresh workflow shell and Clear to wipe the current canvas while keeping the workflow title.",
    placement: "bottom",
  },
  {
    selector: '[data-tour-id="node-palette"]',
    title: "Add steps from the node palette",
    content:
      "Click or drag these cards into the canvas to build your flow. Each node type has its own validation and editing form.",
    placement: "right",
  },
  {
    selector: '[data-tour-id="starter-workflows"]',
    title: "Load a starter workflow",
    content:
      "These starter flows help new users understand the app structure quickly. The tour will scroll this section into view when needed.",
    placement: "right",
  },
  {
    selector: '[data-tour-id="workflow-canvas"]',
    title: "Build on the main canvas",
    content:
      "This is the core designer surface. Drop nodes here, connect them, and use the minimap and controls to navigate larger graphs.",
    placement: "top",
  },
  {
    selector: '[data-tour-id="inspector-panel"]',
    title: "Edit details in the inspector",
    content:
      "Click any node to open its settings here. This panel is where labels, assignments, approvals, automations, and outcomes are configured.",
    placement: "left",
  },
  {
    selector: '[data-tour-id="graph-status"]',
    title: "Watch graph health and save state",
    content:
      "The bottom status bar shows node counts, link counts, validation errors, and whether the current workflow is saved or still dirty.",
    placement: "top",
  },
];

interface SpotlightRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTooltipPosition(rect: SpotlightRect | null, placement: TourPlacement) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 18;
  const fallbackWidth = Math.min(TOOLTIP_WIDTH, viewportWidth - 32);

  if (!rect) {
    return {
      left: clamp(
        (viewportWidth - fallbackWidth) / 2,
        16,
        Math.max(16, viewportWidth - fallbackWidth - 16),
      ),
      top: clamp(viewportHeight - 220, 16, Math.max(16, viewportHeight - 220)),
      width: fallbackWidth,
    };
  }

  let left = rect.left;
  let top = rect.top + rect.height + gap;

  if (placement === "top") {
    top = rect.top - 190 - gap;
  } else if (placement === "left") {
    left = rect.left - fallbackWidth - gap;
    top = rect.top + rect.height / 2 - 90;
  } else if (placement === "right") {
    left = rect.left + rect.width + gap;
    top = rect.top + rect.height / 2 - 90;
  }

  return {
    left: clamp(left, 16, Math.max(16, viewportWidth - fallbackWidth - 16)),
    top: clamp(top, 16, Math.max(16, viewportHeight - 190 - 16)),
    width: fallbackWidth,
  };
}

export function OnboardingTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex] ?? TOUR_STEPS[0];

  const measureStep = useMemo(
    () => () => {
      if (!currentStep) {
        return;
      }

      const target = document.querySelector<HTMLElement>(currentStep.selector);
      if (!target) {
        setSpotlightRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setSpotlightRect({
        left: Math.max(8, rect.left - SPOTLIGHT_PADDING),
        top: Math.max(8, rect.top - SPOTLIGHT_PADDING),
        width: Math.min(window.innerWidth - 16, rect.width + SPOTLIGHT_PADDING * 2),
        height: Math.min(window.innerHeight - 16, rect.height + SPOTLIGHT_PADDING * 2),
      });
    },
    [currentStep],
  );

  useEffect(() => {
    try {
      const hasSeenTour = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasSeenTour) {
        const timer = window.setTimeout(() => {
          setIsRunning(true);
        }, 650);

        return () => window.clearTimeout(timer);
      }
    } catch {
      setIsRunning(true);
    }
  }, []);

  useEffect(() => {
    if (!isRunning || !currentStep) {
      return;
    }

    const target = document.querySelector<HTMLElement>(currentStep.selector);
    if (!target) {
      setSpotlightRect(null);
      return;
    }

    target.dataset.tourActive = "true";
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    const firstMeasure = window.setTimeout(measureStep, 260);
    const secondMeasure = window.setTimeout(measureStep, 520);

    const handleViewportChange = () => {
      measureStep();
    };

    window.addEventListener("resize", handleViewportChange);
    document.addEventListener("scroll", handleViewportChange, true);

    return () => {
      delete target.dataset.tourActive;
      window.clearTimeout(firstMeasure);
      window.clearTimeout(secondMeasure);
      window.removeEventListener("resize", handleViewportChange);
      document.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [currentStep, isRunning, measureStep]);

  const endTour = () => {
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");
    } catch {
      // Ignore storage failures and still close the tour.
    }
    setIsRunning(false);
    setSpotlightRect(null);
    setCurrentStepIndex(0);
  };

  if (!isRunning || !currentStep) {
    return null;
  }

  const tooltipPosition = getTooltipPosition(spotlightRect, currentStep.placement ?? "bottom");
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <>
      <div className="tour-overlay" aria-hidden="true">
        {spotlightRect ? (
          <>
            <div
              className="tour-overlay__segment"
              style={{ left: 0, top: 0, width: "100vw", height: spotlightRect.top }}
            />
            <div
              className="tour-overlay__segment"
              style={{
                left: 0,
                top: spotlightRect.top,
                width: spotlightRect.left,
                height: spotlightRect.height,
              }}
            />
            <div
              className="tour-overlay__segment"
              style={{
                left: spotlightRect.left + spotlightRect.width,
                top: spotlightRect.top,
                width: `calc(100vw - ${spotlightRect.left + spotlightRect.width}px)`,
                height: spotlightRect.height,
              }}
            />
            <div
              className="tour-overlay__segment"
              style={{
                left: 0,
                top: spotlightRect.top + spotlightRect.height,
                width: "100vw",
                height: `calc(100vh - ${spotlightRect.top + spotlightRect.height}px)`,
              }}
            />
            <div
              className="tour-spotlight"
              style={{
                left: spotlightRect.left,
                top: spotlightRect.top,
                width: spotlightRect.width,
                height: spotlightRect.height,
              }}
            />
          </>
        ) : (
          <div className="tour-overlay__segment" style={{ inset: 0 }} />
        )}
      </div>

      <div
        aria-label={currentStep.title}
        className="tour-tooltip"
        role="dialog"
        style={{
          left: tooltipPosition.left,
          top: tooltipPosition.top,
          width: tooltipPosition.width,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono-label">Quick guide</p>
            <p className="mt-1 font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-text-primary">
              {currentStep.title}
            </p>
          </div>
          <button
            aria-label="Close tour"
            className="rounded-full p-1.5 text-text-muted transition hover:bg-surface-2 hover:text-text-primary"
            type="button"
            onClick={endTour}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-text-secondary">{currentStep.content}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}
          </p>

          <div className="flex items-center gap-2">
            <Button size="sm" type="button" variant="ghost" onClick={endTour}>
              Skip
            </Button>
            {currentStepIndex > 0 ? (
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setCurrentStepIndex((step) => Math.max(0, step - 1))}
              >
                Back
              </Button>
            ) : null}
            <Button
              size="sm"
              type="button"
              variant="primary"
              onClick={() => {
                if (isLastStep) {
                  endTour();
                  return;
                }

                setCurrentStepIndex((step) => Math.min(TOUR_STEPS.length - 1, step + 1));
              }}
            >
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
