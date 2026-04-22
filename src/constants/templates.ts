import { createId } from "@lib/utils";
import type { ImportedWorkflowFile, WorkflowEdge, WorkflowNode } from "@types-app/workflow.types";

function makeEdge(source: string, target: string, sourceHandle?: string): WorkflowEdge {
  return {
    id: createId("edge"),
    type: "default",
    source,
    target,
    sourceHandle: sourceHandle ?? null,
    animated: false,
    data: {},
  };
}

function makeNode(node: WorkflowNode): WorkflowNode {
  return node;
}

export const WORKFLOW_TEMPLATES: ImportedWorkflowFile[] = [
  {
    name: "Employee Onboarding",
    description: "A guided workflow for documents, approvals, provisioning, and welcome steps.",
    graph: {
      nodes: [
        makeNode({
          id: "tmpl-start",
          type: "startNode",
          position: { x: 420, y: 60 },
          data: {
            nodeType: "startNode",
            label: "New Employee Created",
            metadata: [
              { id: "meta-1", key: "department", value: "Product" },
              { id: "meta-2", key: "location", value: "Bengaluru" },
            ],
          },
        }),
        makeNode({
          id: "tmpl-task-docs",
          type: "taskNode",
          position: { x: 420, y: 220 },
          data: {
            nodeType: "taskNode",
            label: "Collect Documents",
            description: "Gather ID proof, address proof, and signed NDA.",
            assignee: "HR Operations",
            dueDate: "2026-04-30",
            priority: "high",
            customFields: [{ id: "cf-1", key: "checklist", value: "ID, PAN, Bank" }],
          },
        }),
        makeNode({
          id: "tmpl-task-it",
          type: "taskNode",
          position: { x: 420, y: 380 },
          data: {
            nodeType: "taskNode",
            label: "IT Setup Request",
            description: "Queue laptop allocation and account setup.",
            assignee: "IT Infrastructure",
            dueDate: "2026-05-01",
            priority: "critical",
            customFields: [{ id: "cf-2", key: "device_profile", value: "Engineering MacBook" }],
          },
        }),
        makeNode({
          id: "tmpl-approval",
          type: "approvalNode",
          position: { x: 420, y: 540 },
          data: {
            nodeType: "approvalNode",
            label: "HR Review",
            approverRole: "Manager",
            autoApproveThreshold: 85,
            requireAllApprovers: false,
            timeoutHours: 48,
          },
        }),
        makeNode({
          id: "tmpl-auto-mail",
          type: "automatedStepNode",
          position: { x: 420, y: 700 },
          data: {
            nodeType: "automatedStepNode",
            label: "Send Welcome Email",
            actionId: "send_email",
            actionParams: {
              to: "newhire@company.com",
              subject: "Welcome to NexusFlow",
              template: "welcome",
            },
          },
        }),
        makeNode({
          id: "tmpl-auto-ticket",
          type: "automatedStepNode",
          position: { x: 420, y: 860 },
          data: {
            nodeType: "automatedStepNode",
            label: "Create Access Ticket",
            actionId: "create_ticket",
            actionParams: {
              title: "Provision laptop and SaaS access",
              priority: "high",
              team: "IT Infrastructure",
            },
          },
        }),
        makeNode({
          id: "tmpl-end",
          type: "endNode",
          position: { x: 420, y: 1020 },
          data: {
            nodeType: "endNode",
            label: "Onboarding Ready",
            endMessage: "Employee setup is complete and ready for day one.",
            showSummary: true,
            outcomeType: "success",
          },
        }),
      ],
      edges: [
        makeEdge("tmpl-start", "tmpl-task-docs"),
        makeEdge("tmpl-task-docs", "tmpl-task-it"),
        makeEdge("tmpl-task-it", "tmpl-approval"),
        makeEdge("tmpl-approval", "tmpl-auto-mail", "approved"),
        makeEdge("tmpl-auto-mail", "tmpl-auto-ticket"),
        makeEdge("tmpl-auto-ticket", "tmpl-end"),
      ],
    },
  },
  {
    name: "Leave Approval",
    description: "Collect a leave request, route approval, and update HR data.",
    graph: {
      nodes: [
        makeNode({
          id: "leave-start",
          type: "startNode",
          position: { x: 420, y: 60 },
          data: {
            nodeType: "startNode",
            label: "Leave Requested",
            metadata: [{ id: "leave-meta-1", key: "type", value: "Annual Leave" }],
          },
        }),
        makeNode({
          id: "leave-task",
          type: "taskNode",
          position: { x: 420, y: 220 },
          data: {
            nodeType: "taskNode",
            label: "Submit Leave Request",
            description: "Confirm dates, handover notes, and backup owner.",
            assignee: "Employee",
            dueDate: "2026-05-02",
            priority: "medium",
            customFields: [{ id: "leave-cf-1", key: "backup_owner", value: "Priya" }],
          },
        }),
        makeNode({
          id: "leave-approval",
          type: "approvalNode",
          position: { x: 420, y: 380 },
          data: {
            nodeType: "approvalNode",
            label: "Manager Approval",
            approverRole: "Manager",
            autoApproveThreshold: 50,
            requireAllApprovers: false,
            timeoutHours: 24,
          },
        }),
        makeNode({
          id: "leave-hris",
          type: "automatedStepNode",
          position: { x: 420, y: 540 },
          data: {
            nodeType: "automatedStepNode",
            label: "Update HRIS Status",
            actionId: "update_hris",
            actionParams: {
              field: "employment_status",
              value: "Leave Approved",
              effective_date: "2026-05-07",
            },
          },
        }),
        makeNode({
          id: "leave-end",
          type: "endNode",
          position: { x: 420, y: 700 },
          data: {
            nodeType: "endNode",
            label: "Leave Confirmed",
            endMessage: "The leave request has been approved and recorded.",
            showSummary: true,
            outcomeType: "success",
          },
        }),
      ],
      edges: [
        makeEdge("leave-start", "leave-task"),
        makeEdge("leave-task", "leave-approval"),
        makeEdge("leave-approval", "leave-hris", "approved"),
        makeEdge("leave-hris", "leave-end"),
      ],
    },
  },
  {
    name: "Document Verification",
    description: "Review uploaded documents, generate output, and approve completion.",
    graph: {
      nodes: [
        makeNode({
          id: "doc-start",
          type: "startNode",
          position: { x: 420, y: 60 },
          data: {
            nodeType: "startNode",
            label: "Documents Received",
            metadata: [{ id: "doc-meta-1", key: "channel", value: "Portal Upload" }],
          },
        }),
        makeNode({
          id: "doc-upload",
          type: "taskNode",
          position: { x: 420, y: 220 },
          data: {
            nodeType: "taskNode",
            label: "Upload Documents",
            description: "Collect source docs and confirm completeness.",
            assignee: "Applicant",
            dueDate: "2026-05-03",
            priority: "high",
            customFields: [{ id: "doc-cf-1", key: "bundle", value: "Passport, Address Proof" }],
          },
        }),
        makeNode({
          id: "doc-generate",
          type: "automatedStepNode",
          position: { x: 420, y: 380 },
          data: {
            nodeType: "automatedStepNode",
            label: "Generate PDF",
            actionId: "generate_doc",
            actionParams: {
              template: "policy_doc",
              recipient: "Verification Packet",
              format: "pdf",
            },
          },
        }),
        makeNode({
          id: "doc-approval",
          type: "approvalNode",
          position: { x: 420, y: 540 },
          data: {
            nodeType: "approvalNode",
            label: "Director Review",
            approverRole: "Director",
            autoApproveThreshold: 92,
            requireAllApprovers: true,
            timeoutHours: 72,
          },
        }),
        makeNode({
          id: "doc-end",
          type: "endNode",
          position: { x: 420, y: 700 },
          data: {
            nodeType: "endNode",
            label: "Verification Complete",
            endMessage: "All documents were validated and archived.",
            showSummary: true,
            outcomeType: "success",
          },
        }),
      ],
      edges: [
        makeEdge("doc-start", "doc-upload"),
        makeEdge("doc-upload", "doc-generate"),
        makeEdge("doc-generate", "doc-approval"),
        makeEdge("doc-approval", "doc-end", "approved"),
      ],
    },
  },
  {
    name: "Exit Interview Process",
    description: "Coordinate exit paperwork, meeting logistics, approvals, and HR record updates.",
    graph: {
      nodes: [
        makeNode({
          id: "exit-start",
          type: "startNode",
          position: { x: 420, y: 60 },
          data: {
            nodeType: "startNode",
            label: "Offboarding Triggered",
            metadata: [{ id: "exit-meta-1", key: "reason", value: "Resignation" }],
          },
        }),
        makeNode({
          id: "exit-task",
          type: "taskNode",
          position: { x: 420, y: 220 },
          data: {
            nodeType: "taskNode",
            label: "Self Evaluation Form",
            description: "Collect feedback and returning-assets checklist.",
            assignee: "Employee",
            dueDate: "2026-05-05",
            priority: "medium",
            customFields: [{ id: "exit-cf-1", key: "asset_return", value: "Laptop, Badge" }],
          },
        }),
        makeNode({
          id: "exit-meeting",
          type: "automatedStepNode",
          position: { x: 420, y: 380 },
          data: {
            nodeType: "automatedStepNode",
            label: "Schedule Exit Meeting",
            actionId: "schedule_meeting",
            actionParams: {
              title: "Exit Interview",
              duration_mins: "45",
              attendees: "hr@company.com, manager@company.com",
              location: "Conference Room 2",
            },
          },
        }),
        makeNode({
          id: "exit-approval",
          type: "approvalNode",
          position: { x: 420, y: 540 },
          data: {
            nodeType: "approvalNode",
            label: "HR Approval",
            approverRole: "HRBP",
            autoApproveThreshold: 70,
            requireAllApprovers: false,
            timeoutHours: 24,
          },
        }),
        makeNode({
          id: "exit-update",
          type: "automatedStepNode",
          position: { x: 420, y: 700 },
          data: {
            nodeType: "automatedStepNode",
            label: "Update HRIS Record",
            actionId: "update_hris",
            actionParams: {
              field: "employment_status",
              value: "Exited",
              effective_date: "2026-05-10",
            },
          },
        }),
        makeNode({
          id: "exit-end",
          type: "endNode",
          position: { x: 420, y: 860 },
          data: {
            nodeType: "endNode",
            label: "Exit Closed",
            endMessage: "The offboarding flow has been completed and logged.",
            showSummary: true,
            outcomeType: "cancelled",
          },
        }),
      ],
      edges: [
        makeEdge("exit-start", "exit-task"),
        makeEdge("exit-task", "exit-meeting"),
        makeEdge("exit-meeting", "exit-approval"),
        makeEdge("exit-approval", "exit-update", "approved"),
        makeEdge("exit-update", "exit-end"),
      ],
    },
  },
];
