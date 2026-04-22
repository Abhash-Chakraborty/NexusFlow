import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import Database from "better-sqlite3";
import { resolveDatabasePath, resolveDatabaseUrl } from "./runtime-paths.mjs";

function ensureMigrationTable(sqlite) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "hash" text NOT NULL,
      "created_at" numeric
    );
  `);
}

function listMigrationEntries(migrationsFolder) {
  const journalPath = join(migrationsFolder, "meta", "_journal.json");

  if (!existsSync(journalPath)) {
    return readdirSync(migrationsFolder)
      .filter((fileName) => fileName.endsWith(".sql"))
      .sort()
      .map((fileName, index) => ({
        idx: index,
        tag: fileName.replace(/\.sql$/, ""),
        when: Date.now(),
      }));
  }

  const journal = JSON.parse(readFileSync(journalPath, "utf8"));

  return [...(journal.entries ?? [])].sort((left, right) => left.idx - right.idx);
}

function readAppliedMigrationHashes(sqlite) {
  const rows = sqlite.prepare(`SELECT "hash" FROM "__drizzle_migrations"`).all();
  return new Set(rows.map((row) => row.hash));
}

function splitMigrationStatements(sql) {
  return sql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function applyFileMigration(sqlite, sql, createdAt) {
  const statements = splitMigrationStatements(sql);
  const insertMigration = sqlite.prepare(
    `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)`,
  );

  const hash = createHash("sha256").update(sql).digest("hex");

  sqlite.transaction(() => {
    for (const statement of statements) {
      sqlite.exec(statement);
    }

    insertMigration.run(hash, createdAt);
  })();

  return hash;
}

export function runMigrations(
  databaseUrl = process.env.DATABASE_URL ?? "file:./data/nexusflow.db",
) {
  const normalizedDatabaseUrl = resolveDatabaseUrl(databaseUrl);
  const resolvedPath = resolveDatabasePath(normalizedDatabaseUrl);

  if (resolvedPath !== ":memory:") {
    mkdirSync(dirname(resolvedPath), { recursive: true });
  }

  const sqlite = new Database(resolvedPath);
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  ensureMigrationTable(sqlite);

  const migrationsFolder = join(process.cwd(), "drizzle", "migrations");
  const appliedHashes = readAppliedMigrationHashes(sqlite);
  const migrationEntries = listMigrationEntries(migrationsFolder);

  for (const entry of migrationEntries) {
    const sqlPath = join(migrationsFolder, `${entry.tag}.sql`);
    const sql = readFileSync(sqlPath, "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");

    if (appliedHashes.has(hash)) {
      continue;
    }

    applyFileMigration(sqlite, sql, entry.when ?? Date.now());
    appliedHashes.add(hash);
  }

  sqlite.close();

  return resolvedPath;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const resolvedPath = runMigrations();
  console.log(`[nexusflow] migrations ready at ${resolvedPath}`);
}
