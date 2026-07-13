# RAG App — Implementation Plan

## Tech Stack

| Technology | Version/Notes |
|---|---|
| **Next.js** 16.2.10 | App Router, `params`/`searchParams` as Promises |
| **AI SDK** 7.x | `streamText`, `tool`, `createUIMessageStreamResponse` |
| **shadcn/ui** | Latest, with Tailwind v4 |
| **PostgreSQL + pgvector** | Docker-based, `CREATE EXTENSION vector` |
| **Drizzle ORM** ≥0.36 | Native `vector` column type, `cosineDistance` helper |
| **TanStack Query** v5 | Client-side fetching (queries/mutations) |
| **Axios** | HTTP client |
| **nuqs** 2.x | URL query state via `useQueryState`/`useQueryStates` |
| **Valkey** | Redis-compatible in-memory cache (Docker) |
| **Docker Compose** | PostgreSQL + Valkey containers |

---

## Phase 1: Docker Infrastructure

**Files:**
- `docker-compose.yml` — postgres (with pgvector image `pgvector/pgvector:pg17`) + valkey (`valkey/valkey:8`)
- `.env.example` — template for all env vars

**Key decisions:**
- Use `pgvector/pgvector:pg17` image (official pgvector Docker image, Postgres 17)
- Use `valkey/valkey:8` for Valkey
- Expose PG on `5432`, Valkey on `6379`
- Named volumes for persistence

---

## Phase 2: Database Schema (Drizzle)

**Directory structure:**
```
lib/
  db/
    index.ts              ← drizzle client singleton
    schema/
      resources.ts        ← source documents table
      embeddings.ts       ← vector embeddings table (FK to resources)
    migrations/
      0000_enable_pgvector.sql  ← extension setup
```

**Tables:**
1. **`resources`** — `id` (varchar PK), `content` (text), `createdAt`, `updatedAt`
2. **`embeddings`** — `id` (varchar PK), `resourceId` (FK→resources), `content` (text chunk), `embedding` (vector(1536)), HNSW index with `vector_cosine_ops`

**Drizzle config:**
- `drizzle.config.ts` — schema path, output path, dialect = postgresql
- Scripts in `package.json`: `db:generate`, `db:migrate`, `db:studio`, `db:push`

**Important gotchas:**
- `CREATE EXTENSION IF NOT EXISTS vector` must run before any migration
- Drizzle ≥0.36 has native `vector` type — no `customType` needed
- `cosineDistance` helper available from `drizzle-orm`

---

## Phase 3: AI SDK Integration

**Directory:**
```
lib/
  ai/
    embedding.ts      ← generateChunks, generateEmbeddings, findRelevantContent
    rag.ts            ← RAG pipeline (answer function)
```

**Flow:**
1. User sends message → `useChat` → POST `/api/chat`
2. Route handler uses `streamText` with:
   - System prompt instructing tool usage only
   - **`addResource` tool** — calls `createResource` server action (chunk + embed + store)
   - **`getInformation` tool** — embeds user query → cosine similarity search → returns relevant chunks
3. `stopWhen: isStepCount(5)` for multi-step follow-up responses

**Key AI SDK 7 APIs:**
- `streamText({ model, system, messages, tools, stopWhen })`
- `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream }) })`
- `convertToModelMessages(messages)` — UI messages → model messages
- `tool({ description, inputSchema, execute })`

---

## Phase 4: Frontend (shadcn/ui + TanStack Query + nuqs)

**Pages & Components:**
```
app/
  layout.tsx              ← NuqsAdapter wrapper, QueryProvider, ThemeProvider
  page.tsx                ← Chat page (client component)
  api/
    chat/route.ts         ← AI SDK streamText route handler
components/
  chat/
    chat-input.tsx        ← shadcn Input + Button
    chat-message.tsx      ← renders tool calls + text
    chat-messages.tsx     ← scrollable message list
providers/
  query-provider.tsx      ← TanStack QueryClientProvider
```

**nuqs setup:**
- Wrap layout with `<NuqsAdapter>`
- Use `useQueryState('q', parseAsString)` for search query in URL
- Or `useQueryStates` for multiple params (query, page, source filter)

**TanStack Query usage:**
- `@tanstack/react-query` on client for fetching data lists (e.g., browsing resources)
- Server Actions for mutations (create resource)
- API route `/api/chat` handles streaming AI responses

**shadcn/ui components to add:**
- `button`, `input`, `card`, `scroll-area`, `separator`, `skeleton`
- Custom chat bubble components

---

## Phase 5: Valkey Caching (Optional Enhancement)

- Cache embedding results (same text → same embedding)
- Cache query results for repeated questions
- Use `@ai-sdk/caching-middleware` or custom Redis approach
- `ioredis` or `redis` npm package with Valkey connection

---

## Project File Structure (Proposed)

```
next_rag/
├── docker-compose.yml
├── .env.example
├── .env
├── drizzle.config.ts
├── package.json
├── app/
│   ├── layout.tsx             ← NuqsAdapter + QueryProvider + ThemeProvider
│   ├── page.tsx               ← Chat (client component with useChat)
│   ├── api/
│   │   └── chat/route.ts      ← POST handler for streamText
│   └── globals.css
├── components/
│   ├── ui/                    ← shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── scroll-area.tsx
│   └── chat/
│       ├── chat-input.tsx
│       ├── chat-message.tsx
│       └── chat-messages.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts           ← drizzle client
│   │   ├── schema/
│   │   │   ├── resources.ts
│   │   │   └── embeddings.ts
│   │   └── migrations/
│   │       └── 0000_enable_pgvector.sql
│   ├── ai/
│   │   ├── embedding.ts
│   │   └── rag.ts
│   ├── actions/
│   │   └── resources.ts       ← Server Actions
│   └── utils.ts               ← nanoid, shared helpers
├── providers/
│   ├── query-provider.tsx
│   └── theme-provider.tsx
└── public/
```

---

## Implementation Order

| Step | Description | Est. files |
|------|-------------|-----------|
| 1 | Docker Compose: postgres+pgvector + valkey | 1 file |
| 2 | Drizzle setup: config, schema, client, extension migration | 5 files |
| 3 | Install all deps: `ai`, `@ai-sdk/react`, `drizzle-orm`, `drizzle-kit`, `postgres`, `@tanstack/react-query`, `axios`, `nuqs`, `shadcn/ui`, `ioredis` | 1 file |
| 4 | shadcn/ui init + components | ~6 files |
| 5 | AI SDK embedding + RAG logic (`lib/ai/`) | 2 files |
| 6 | Server Actions (`lib/actions/resources.ts`) | 1 file |
| 7 | API Route (`app/api/chat/route.ts`) | 1 file |
| 8 | Layout with NuqsAdapter + QueryProvider | 2 files |
| 9 | Chat UI components | 3 files |
| 10 | Valkey cache integration (optional) | 1 file |

---

## Key Gotchas & Learnings

1. **Next.js 16**: `params` is `Promise<{...}>` — must `await params`, same for `searchParams`
2. **AI SDK 7**: Use `convertToModelMessages()` + `createUIMessageStreamResponse()` + `toUIMessageStream()` for streaming chat — this is the new API, not the old `Response`-based approach
3. **Drizzle + pgvector**: ≥0.36 has native `vector` column — no `customType` needed; `cosineDistance` helper is exported from `drizzle-orm`
4. **pgvector Docker**: Use `pgvector/pgvector:pg17` image, not plain postgres
5. **nuqs**: Wrap `<NuqsAdapter>` in layout; parse queries with `parseAsString`, `parseAsInteger` etc.
6. **Valkey**: Drop-in Redis replacement — use `ioredis` or `redis` npm package with `host: 'localhost', port: 6379`
