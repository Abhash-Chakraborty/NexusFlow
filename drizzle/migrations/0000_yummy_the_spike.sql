CREATE TABLE `node_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`node_id` text NOT NULL,
	`node_type` text NOT NULL,
	`data_json` text NOT NULL,
	`label` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_node_versions_workflow_node` ON `node_versions` (`workflow_id`,`node_id`);--> statement-breakpoint
CREATE TABLE `simulation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text,
	`graph_snapshot_json` text NOT NULL,
	`result_json` text NOT NULL,
	`duration_ms` integer NOT NULL,
	`success` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_simulation_runs_workflow` ON `simulation_runs` (`workflow_id`);--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`graph_json` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`node_count` integer DEFAULT 0 NOT NULL,
	`edge_count` integer DEFAULT 0 NOT NULL,
	`is_valid` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_workflows_updated_at` ON `workflows` (`updated_at`);