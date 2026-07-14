# Cortex — AI-Powered RAG Chat

A brain for your LLM to know you better. RAG (Retrieval-Augmented Generation) implementation with Next.js, PostgreSQL + pgvector, and Drizzle ORM.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| UI Library | shadcn/ui (`base-nova` style, `olive` base) |
| Database | PostgreSQL 17 + pgvector |
| ORM | Drizzle ORM (1.0.0-rc.4) |
| Auth | Better Auth (email/password + Google OAuth) |
| Server State | TanStack React Query |
| AI SDK | Vercel AI SDK (planned) |
| Caching | Valkey 8 (Redis-compatible, planned) |
| Container | Docker Compose (PostgreSQL + Valkey) |

## Features

### Implemented

| Feature | Description |
|---|---|
| **Docker Infrastructure** | PostgreSQL 17 with pgvector extension on port 5432, Valkey 8 on port 6379, with health checks and persistent volumes |
| **Database Layer** | Drizzle ORM with 6 tables — `resources`, `embeddings` (vector(1536) + HNSW index), `documents`, `user`, `session`, `account`, `verification` |
| **Document Tracking** | Scan `docs/` folder, SHA-256 hash files, track ingestion status in `documents` table |
| **Authentication** | Email/password sign-up and sign-in, Google OAuth, session management via Better Auth |
| **Protected Routes** | Middleware redirects unauthenticated users away from `/dashboard` and `/chat` to `/sign-in` |
| **Dashboard** | Full dashboard with collapsible sidebar, document tracking table, breadcrumbs, theme toggle |
| **Responsive UI** | 60+ shadcn/ui components, mobile-aware sidebar, dark/light mode with `next-themes` |
| **React Query Integration** | Client-side API layer with hooks for auth, documents, chat, and resources |
| **Developer Tooling** | Drizzle Studio, database migrations, ESLint flat config, React Compiler enabled |

### In Development (Planned)

| Feature | Status |
|---|---|
| **Embedding Pipeline** | `generateChunks()`, `generateEmbeddings()`, `findRelevantContent()` |
| **RAG Pipeline** | `streamText`-based RAG answer generation with tools |
| **Chat API** | POST route handler with `addResource` and `getInformation` tools |
| **Chat UI** | Chat input, message bubbles, scrollable message list |
| **Valkey Caching** | Cache embeddings and query results for repeated questions |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [Docker](https://docker.com/) (for PostgreSQL + Valkey)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start database and cache
docker compose up -d

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# 4. Push schema to database
pnpm db:push

# 5. Run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `VALKEY_URL` | No | Valkey connection string (defaults to `redis://localhost:6379`) |
| `AI_GATEWAY_API_KEY` | Yes* | For embeddings and chat via Vercel AI Gateway |
| `BETTER_AUTH_SECRET` | Yes | Secret for Better Auth |
| `BETTER_AUTH_URL` | Yes | Your app URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | No* | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No* | Google OAuth client secret |

*\* Required for the corresponding feature.*

## Commands

| Action | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Production start | `pnpm start` |
| Lint | `pnpm lint` |
| Typecheck | `npx tsc --noEmit` |
| DB migration generate | `pnpm db:generate` |
| DB migration apply | `pnpm db:migrate` |
| DB push schema | `pnpm db:push` |
| Drizzle Studio | `pnpm db:studio` |
| Clean caches/deps | `pnpm clean` |

## Project Structure

```
app/                          # App Router pages + API routes
├── (authenticated)/          # Protected routes
│   └── dashboard/            # Dashboard page + layout
├── (unauthenticated)/        # Public routes
│   ├── sign-in/              # Login page
│   └── sign-up/              # Registration page
└── api/                      # API route handlers
    ├── auth/                 # Better Auth catch-all
    ├── scan-docs/            # Document scanner
    └── documents/            # Document listing

api/                          # Client-side API layer
├── auth/                     # Auth API + React Query hooks
├── chat/                     # Chat API (stubs, planned)
├── documents/                # Documents API + React Query hooks
└── resources/                # Resources API (stubs, planned)

components/
├── ui/                       # 60+ shadcn/ui components
├── app-sidebar.tsx           # Application sidebar
├── documents-table.tsx       # Document tracking table
├── navbar.tsx                # Public navbar
└── ...                       # Other custom components

lib/
├── db/                       # Drizzle client, schema, migrations
├── auth.ts                   # Better Auth server config
├── auth-client.ts            # Better Auth client config
└── utils.ts                  # cn() utility

docs/                         # Source documents for RAG ingestion
providers/                    # React providers (QueryProvider, etc.)
hooks/                        # Custom hooks (use-mobile)
```

## Architecture Notes

- **RAG Flow**: Documents ingested → chunked → embedded (vector(1536)) → stored in pgvector → retrieved via cosine similarity at query time
- **AI SDK 7**: Planned integration uses `streamText` with `convertToModelMessages` and tool-based resource access
- **React Compiler**: Enabled — components are implicitly memoized
- **Tailwind v4**: CSS-first configuration in `app/globals.css` (no `tailwind.config.js`)
