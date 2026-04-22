# Contributing to NexusFlow

Thanks for helping improve NexusFlow.

## Workflow

1. Create a feature branch from `main`.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `.env.local` if you need overrides.
4. Run `pnpm check` before opening a PR or sharing a patch.
5. Run `pnpm build` for changes that affect runtime behavior, routing, or packaging.

## Standards

- Use TypeScript strict mode without `any` or `@ts-ignore`.
- Keep shared contracts in `src/types` and `src/lib/workflow-schemas.ts`.
- Validate request bodies with Zod before business logic runs.
- Prefer small, pure helpers in `src/lib` for workflow logic that needs test coverage.
- Use `apply_patch`-style minimal edits when adjusting generated or large files.

## Testing

- `pnpm test` runs unit tests for the validator, simulator, request parsing, and optimistic locking.
- `pnpm check` runs typecheck, Biome, and tests together.
- `pnpm build` verifies the Next.js production bundle.
- `docker compose up --build` verifies the container path, runtime migrations, and health checks.

## Pull Request Notes

- Include a short summary of behavior changes.
- Mention any API, schema, or Docker changes explicitly.
- Add or update tests when business rules change.
