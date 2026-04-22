import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { env } from "@lib/env";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

const dbPath = env.DATABASE_URL.replace(/^file:/, "");
const isMemoryDatabase = dbPath === ":memory:";
const isWindowsAbsolutePath = /^[A-Za-z]:[\\/]/.test(dbPath);
const resolvedPath =
  isMemoryDatabase || isAbsolute(dbPath) || isWindowsAbsolutePath
    ? dbPath
    : join(/* turbopackIgnore: true */ process.cwd(), dbPath.replace(/^[.][/\\]/, ""));

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDb() {
  if (!isMemoryDatabase) {
    mkdirSync(dirname(resolvedPath), { recursive: true });
  }

  const sqlite = new Database(resolvedPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("synchronous = NORMAL");

  return drizzle(sqlite, { schema });
}

export function getDb() {
  if (!cachedDb) {
    cachedDb = createDb();
  }

  return cachedDb;
}

export type DB = ReturnType<typeof getDb>;
