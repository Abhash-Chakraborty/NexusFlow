import { defineConfig } from "drizzle-kit";

import { env } from "./src/lib/env";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL.replace(/^file:/, ""),
  },
  strict: true,
  verbose: true,
});
