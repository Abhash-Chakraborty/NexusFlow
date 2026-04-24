import { WORKFLOW_TEMPLATES } from "@constants/templates";
import { getDb } from "@lib/db";

import { createWorkflow } from "./queries/workflows";
import { workflows } from "./schema";

async function main() {
  const db = getDb();
  const existing = await db.select({ id: workflows.id }).from(workflows).limit(1);

  if (existing.length > 0) {
    console.log("Seed skipped: workflows already exist.");
    return;
  }

  for (const template of WORKFLOW_TEMPLATES.slice(0, 2)) {
    await createWorkflow({
      name: template.name,
      description: template.description,
      graphJson: JSON.stringify(template.graph),
      nodeCount: template.graph.nodes.length,
      edgeCount: template.graph.edges.length,
      isValid: true,
    });
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
