# TaskFlow

A Trello-style project management app: workspaces, projects and a drag-and-drop Kanban board for small teams. It's a portfolio project that shows **Redux Toolkit + RTK Query**, **Next.js App Router** and a layered **Node.js/Express** API on **PostgreSQL**, and its commit history records each step of the build.

> **Status:** Phase 1 (foundation) is done. The monorepo, both apps, shared contracts, the database, health checks and CI are wired up. Auth, workspaces and the board come in later phases.

## Stack

| Area       | Choice                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| Monorepo   | pnpm workspaces + Turborepo                                                              |
| Web        | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui (Base UI), lucide-react    |
| State      | Redux Toolkit + RTK Query _(from Phase 3)_                                               |
| API        | Express 5, helmet, cors, cookie-parser, pino                                             |
| Database   | PostgreSQL 16 (Docker Compose), Prisma 7 with the `pg` driver adapter                    |
| Validation | Zod v4 schemas in `packages/contracts`, shared by API and web                            |
| Testing    | Vitest, Supertest against a real Postgres test database                                  |
| Quality    | TypeScript (strict), ESLint 10 flat config, Prettier, Husky + lint-staged + commitlint   |
| CI         | GitHub Actions: typecheck, lint, format, test (Postgres service), build, commit messages |

## Repository layout

```text
apps/
  api/                Express API
    prisma/           schema.prisma (models arrive in Phase 2)
    prisma.config.ts  Prisma CLI config (schema path, migrations, DATABASE_URL)
    src/
      app.ts          createApp(): middleware, /api/v1 router, 404 + error handler
      server.ts       HTTP server + graceful shutdown
      config/env.ts   Zod-validated environment (fails fast on bad config)
      common/         logger, HttpError
      middleware/     error-handler, not-found
      modules/<domain>/{routes,controller,service}.ts
      prisma/client.ts
  web/                Next.js app (src/app routes, src/components/ui from shadcn)
packages/
  contracts/          Zod enums (TaskStatus, Priority, Role), response/error envelopes, DTOs
  config/             shared tsconfig, ESLint and Prettier presets
docker-compose.yml    Postgres 16 (dev DB `taskflow` + test DB `taskflow_test`)
```

The API is layered as routes → controllers (HTTP only) → services (business rules) → repositories (Prisma). Responses always use the shared envelopes: `{ data }`, `{ data, meta }` or `{ error: { code, message, details? } }`.

## Getting started

**Requirements:** Node.js 22.12+ (see `.nvmrc`), pnpm 10 (`corepack enable`), Docker.

```bash
pnpm install                       # also installs the git hooks
cp apps/api/.env.example apps/api/.env
pnpm db:up                         # Postgres 16 on localhost:5544
pnpm dev                           # web on :4400, API on :4401, contracts in watch mode
```

Open <http://localhost:4400>. The landing page shows a live API/database status pill that calls `/api/v1/health/ready` through the Next.js proxy.

### Ports

| Service  | URL                   | Notes                                                    |
| -------- | --------------------- | -------------------------------------------------------- |
| Web      | http://localhost:4400 | proxies `/api/v1/*` to the API (set `API_URL` to change) |
| API      | http://localhost:4401 | `HOST`/`PORT` in `apps/api/.env`                         |
| Postgres | `localhost:5544`      | override with `POSTGRES_PORT`                            |

### API endpoints (so far)

| Method | Path                   | Description                                            |
| ------ | ---------------------- | ------------------------------------------------------ |
| GET    | `/api/v1/health/live`  | Process is up (never touches the database)             |
| GET    | `/api/v1/health/ready` | `200` when the database answers, `503` when it doesn't |

## Scripts

Run from the repo root. Turborepo runs each one in dependency order across all packages.

| Script                         | What it does                                                  |
| ------------------------------ | ------------------------------------------------------------- |
| `pnpm dev`                     | Run every app in watch mode                                   |
| `pnpm build`                   | Build contracts, API and web                                  |
| `pnpm typecheck`               | `tsc --noEmit` everywhere (generates the Prisma client first) |
| `pnpm lint`                    | ESLint                                                        |
| `pnpm test`                    | Vitest; API tests need `pnpm db:up`                           |
| `pnpm format` / `format:check` | Prettier                                                      |
| `pnpm db:up` / `db:down`       | Start or stop Postgres                                        |

API tests use the `taskflow_test` database by default. Point them somewhere else with `TEST_DATABASE_URL`.

## Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are checked by commitlint in a git hook and in CI. Allowed scopes: `repo`, `config`, `contracts`, `api`, `web`, `db`, `ci`, `deps`. For example: `feat(api): add liveness and readiness health endpoints`.

Each phase is built on its own branch as a series of small commits and merged with a merge commit, so the history on `main` still shows every step.

## Roadmap

1. **Foundation**: monorepo, apps, contracts, Docker Postgres, health checks, tooling, CI ✅
2. Data models: Prisma schema, migrations, seed data
3. Auth: sessions in HttpOnly cookies, argon2id, rate limiting, login/register pages
4. Workspaces and access control
5. Projects
6. Tasks API: filters, atomic numbering, fractional ranks, optimistic concurrency
7. Kanban board with dnd-kit and optimistic moves
8. Filtering and UX polish
9. Members and comments
10. Testing and stabilization (Playwright)
11. Deploy and portfolio polish
