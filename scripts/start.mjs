import { spawn } from "node:child_process";
import { once } from "node:events";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { runMigrations } from "./migrate.mjs";
import { resolveDatabaseUrl } from "./runtime-paths.mjs";

const databaseUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;

const resolvedPath = runMigrations(databaseUrl);
console.log(`[nexusflow] migrations ready at ${resolvedPath}`);

const buildOutputDir = join(process.cwd(), ".next");
const standaloneDir = join(buildOutputDir, "standalone");
const staticAssetsDir = join(buildOutputDir, "static");
const standaloneStaticDir = join(standaloneDir, ".next", "static");
const standaloneServerPath = join(standaloneDir, "server.js");

if (existsSync(staticAssetsDir) && existsSync(standaloneServerPath)) {
  mkdirSync(join(standaloneDir, ".next"), { recursive: true });
  cpSync(staticAssetsDir, standaloneStaticDir, { force: true, recursive: true });
}

const child = existsSync(standaloneServerPath)
  ? spawn(process.execPath, ["server.js"], {
      cwd: standaloneDir,
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    })
  : spawn(process.execPath, ["./node_modules/next/dist/bin/next", "start"], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

const [exitCode, signal] = await once(child, "exit");

if (signal) {
  process.kill(process.pid, signal);
}

process.exit(exitCode ?? 0);
