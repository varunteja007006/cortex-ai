<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Cortex — RAG Chat

> Always assume the dev server (`pnpm dev`) is running. If it isn't, ask the user to start it before making changes that need verification.

## Commands

| Action | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Production start | `pnpm start` |
| Lint | `pnpm lint` |
| Typecheck | `npx tsc --noEmit` (not a script) |
| DB migration generate | `pnpm db:generate` |
| DB migration apply | `pnpm db:migrate` |
| DB push schema | `pnpm db:push` |
| Drizzle Studio | `pnpm db:studio` |
| Clean caches/deps | `pnpm clean` (or `pnpm clean:cache`, `pnpm clean:deps`) |

No test framework is installed. No CI/CD.

## Package manager

**pnpm** only — never `npm` or `yarn`. Lockfile: `pnpm-lock.yaml`.

## Framework & toolchain quirks

- **Next.js 16**: `params` and `searchParams` are Promises — always `await params` / `await searchParams`.
- **Tailwind v4**: CSS-first config in `app/globals.css` (no `tailwind.config.js`). Uses `@theme inline`, `@custom-variant` directives. PostCSS plugin: `@tailwindcss/postcss`.
- **shadcn/ui**: Uses `@shadcn/react` with `render` prop pattern (NOT `asChild`). Style: `base-nova`, base color: `olive`. RSC enabled. Components live in `components/ui/`.
- **React Compiler**: Enabled (`reactCompiler: true` in `next.config.ts`). Components are implicitly memoized. Be aware but don't fight it.
- **ESLint**: Flat config (`eslint.config.mjs`) using `eslint-config-next` core-web-vitals + typescript presets.

## Database (Drizzle ORM + pgvector)

- **Drizzle ORM** `1.0.0-rc.4` with **PostgreSQL** dialect via `node-postgres` pool (`lib/db/index.ts`).
- Native `vector` column type — no `customType` needed. `cosineDistance` helper from `drizzle-orm`.
- Three tables in `lib/db/schema/`:
  - `resources` — source document content
  - `embeddings` — vector(1536) chunks with HNSW index (`vector_cosine_ops`), FK to resources
  - `documents` — file tracking (name, hash, ingestion status)
- **pgvector Docker image**: `pgvector/pgvector:pg17` (not plain postgres).

## Docker (required for local dev)

```bash
docker compose up -d    # starts postgres+pgvector + valkey
```

## AI SDK 7 (planned, not yet installed)

When you add AI SDK packages, the streaming API differs from older versions:
- `convertToModelMessages(messages)` — UI messages → model messages
- `streamText({ model, system, messages, tools, stopWhen })`
- `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream }) })`
- `tool({ description, inputSchema, execute })`

## Key directories

| Path | Purpose |
|---|---|
| `app/` | App Router pages + API routes |
| `app/api/scan-docs/route.ts` | GET — scans `docs/` folder, tracks files |
| `components/ui/` | shadcn/ui components |
| `lib/db/` | Drizzle client + schema + migrations |
| `lib/utils.ts` | `cn()` class merge utility |
| `hooks/use-mobile.ts` | `useIsMobile()` hook |
| `docs/` | Document source files for RAG ingestion |

Planned but not yet created: `lib/ai/`, `lib/actions/`, `app/api/chat/`, `providers/`, `components/chat/`, `app/chat/`.

## Environment

- `.env` is loaded at runtime via `dotenv`. **DATABASE_URL** is required.
- **AI_GATEWAY_API_KEY** (or Vercel OIDC token) required for embeddings/chat via Vercel AI Gateway.
- Valkey URL defaults to `redis://localhost:6379` (no client code yet).
- Live secrets are tracked in `.env` in git despite `.gitignore` — be careful not to expose them.

## Architecture notes

- Not a monorepo. Single package at root.
- Entrypoints: `app/page.tsx` (home, currently CNA boilerplate), `app/dashboard/page.tsx` (dashboard with sidebar).
- `docs/` directory is the document source; `/api/scan-docs` reads files from there, SHA-256 hashes them, and tracks in `documents` table.
- Path alias `@/` maps to root (configured in tsconfig paths).
