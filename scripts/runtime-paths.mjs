import { isAbsolute, join, normalize } from "node:path";

const DEFAULT_DATABASE_URL = "file:./data/nexusflow.db";

export function resolveDatabasePath(
  databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
) {
  const dbPath = databaseUrl.replace(/^file:/, "");
  const isMemoryDatabase = dbPath === ":memory:";
  const isWindowsAbsolutePath = /^[A-Za-z]:[\\/]/.test(dbPath);

  if (isMemoryDatabase || isAbsolute(dbPath) || isWindowsAbsolutePath) {
    return dbPath;
  }

  return join(process.cwd(), dbPath.replace(/^[.][/\\]/, ""));
}

export function resolveDatabaseUrl(databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL) {
  const resolvedPath = resolveDatabasePath(databaseUrl);
  return resolvedPath === ":memory:" ? "file::memory:" : `file:${normalize(resolvedPath)}`;
}
