# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Point of Sale (POS) system for Sniff N' Frolic, built as a monorepo with a React frontend and NestJS backend.

## Development Commands

### Full Stack Startup
```bash
npm run dev:all        # Start DB (Docker) + frontend + backend concurrently
npm run dev            # Start frontend + backend (assumes DB already running)
```

### Individual Services
```bash
npm run db:up          # Start PostgreSQL via Docker
npm run db:down        # Stop PostgreSQL
npm run dev:app        # Vite dev server → localhost:51731
npm run dev:services   # NestJS API → localhost:4000
```

### Backend (from `services/`)
```bash
npm test               # Run Jest unit tests
npm run test:watch     # Jest in watch mode
npm run test:e2e       # E2E tests (jest-e2e.json config)
npm run test:cov       # Coverage report
npm run lint           # ESLint with auto-fix
npm run build          # Compile NestJS app
```

### Frontend (from `app/`)
```bash
npm run build          # tsc + Vite build
npm run lint            # ESLint
npm run preview        # Preview production build
```

## Architecture

```
app/         ← React 19 + Vite frontend (TypeScript)
services/    ← NestJS backend API (TypeScript)
docker-compose.yml  ← PostgreSQL 16 container
```

### Frontend (`app/src/`)
- **`domains/`** — Feature-scoped modules (auth, authorization, users, orders, session, device). Each domain owns its Zustand store, API calls, and TypeScript types.
- **`screens/`** — Route-level components (auth, start, sales, manage, layout).
- **Routing guards**: `RequireAuth` checks for valid session, `RequireShift` checks for active shift before entering POS screens.
- **API base URL**: Hardcoded to `http://localhost:4000` in `domains/auth/api/authApi.ts`.
- **Path alias**: `@/` maps to `app/src/` (configured in `vite.config.ts`).
- **Key libs**: MUI v7, Zustand, TanStack Query, React Router v7, AG Charts.

### Backend (`services/src/`)
- **`modules/`** — NestJS feature modules: `auth`, `users`, `products`, `feature-flags`, `sessions`.
- **`database/`** — `DatabaseService` wraps `pg` connection pool; provides a `transaction()` helper for ACID operations.
- **Auth flow**: Email OTP → bearer token session stored in `auth_sessions` table. Token sent as `Authorization: Bearer <token>` header.
- Global `ValidationPipe` with `whitelist: true, transform: true` applied in `main.ts`.
- CORS enabled.

### Database
PostgreSQL 16 via Docker. Migrations live in `services/db/migrations/` (run manually in order):

| # | Table | Purpose |
|---|-------|---------|
| 001 | `users` | User accounts |
| 002 | `auth_sessions` | Bearer token sessions with TTL, IP, user-agent |
| 003 | `feature_flags` | Feature toggles (auth_enabled, email_otp_login, sales_enabled) |
| 004 | `email_login_codes` | OTP codes for passwordless login |
| 005 | `branch` | Business branches (Vancouver, Burnaby) |

### Environment Variables (`services/.env`)
```
PORT=4000
DATABASE_URL=postgresql://snf:postgres@localhost:5432/sniff_n_frolic_pos
AUTH_OTP_PEPPER=...
SESSION_TTL_DAYS=7
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
APP_SECRET=...
WOO_API_BASE_URL=...   # legacy — only used by the one-off WooCommerce importer
WOO_CONSUMER_KEY=...
WOO_CONSUMER_SECRET=...
```

## Key Patterns

- **Zustand stores** are the source of truth for client-side state (auth token, active session/shift, orders).
- **TanStack Query** handles server state and caching for data fetching.
- **Feature flags** are managed server-side via the `feature_flags` table and exposed through `FeatureFlagsModule`.
- Migrations are plain SQL files applied manually — there is no migration runner.

---

## Product Data Architecture

Products, categories, and brands are the source of truth in a shared Postgres DB, served by **`sniff-n-frolic-api`** (a separate NestJS service). This POS calls that API — it does **not** sync directly with WooCommerce.

### Key facts
- Products table: `id`, `name`, `slug`, `product_type` (`simple` | `variation`), `status` (`published` | `draft` | `archived`), `regular_price` / `sale_price` / `effective_price` (all in **cents**), `stock_quantity`, `stock_status`, `featured_image_url`
- Variation children are linked to their parent by slug pattern: `child.slug LIKE parent.slug || '-%'`
- Categories and brands use junction tables (`product_category_map`, `product_brand_map`) for many-to-many
- `effective_price` is a generated stored column: `COALESCE(sale_price, regular_price)`

### WooCommerce — legacy, not live
`POST /products/import/woocommerce` is a one-off legacy importer used during initial data migration. It is not a live sync. Columns `woo_product_id`, `woo_created_at`, `woo_updated_at`, `synced_at` exist on the products table for historical reasons only and are not written by this POS.

### API endpoints (sniff-n-frolic-api)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/products` | Supports `category`, `brand`, `search`, `on_sale`, `sort`, `page`, `limit` |
| GET | `/products/manage` | All statuses, excludes variation children, requires auth |
| GET | `/products/:slug` | Single product with variations; add `?manage=true` to include draft variants |
| POST | `/products` | Create product; `product_type` defaults to `simple`, pass `"variation"` for variants |
| PUT | `/products/:id` | Partial update (price, stock, status, brands, categories, etc.) |
| PUT | `/products/:id/images` | Replace image gallery |
| GET | `/categories` | All categories with product counts |
| GET | `/brands` | All brands |

---

## Autonomy Rules — when to proceed vs when to stop

### Proceed without asking
- Bug with a clear symptom (error message, clear repro steps)
- Scope is explicit (e.g. "add a search filter to the product hub")
- Extending an existing pattern already present in the codebase (`domains/` structure, Zustand store pattern, NestJS module pattern)
- Fewer than 3 steps, no architectural decision, touches a small number of files

### Stop and summarize first — don't decide alone
- Any change to `services/db/migrations/` (new table or structure change)
- Adding a new external dependency, or replacing an existing one (e.g. Zustand → something else, TanStack Query → something else)
- Any change touching secrets/credentials in `services/.env`
- My instruction has more than one reasonable interpretation

### After each completed step, always
1. Run `npm test` / `npm run lint`, and show the actual output — not just "done"
2. Commit with a descriptive message
3. Summarize progress in 2-3 sentences, then continue to the next step without waiting for my reply — unless you hit one of the "stop" conditions above

---

## Deployment — hard rule

**Production deploys to Railway are done manually by Perry, always. The agent never deploys.**

- Never run any `railway` CLI commands (deploy, up, link, variables set, etc.)
- Never modify production/Railway environment variables
- Passing build/tests does not mean it's ready to deploy — that decision is Perry's
- If a feature is deploy-ready, say so in the summary; do not attempt to deploy it yourself

### Perry's role
Perry doesn't review line-by-line. He reviews: commit history, test/lint output, and step summaries. Deployment is done by him, separately.

---
 
## Git Rules — hard requirements
 
**Perry reviews everything before it reaches main. No exceptions.**
 
- **Never commit directly to `main`.** At the start of each task, create a feature branch named `feature/<short-description>` and do all work there.
- Commit freely and frequently on the feature branch — small, descriptive commits are encouraged.
- **Never merge to `main`, never push to `main`.** When the task is complete, summarize what's on the branch (commits, files touched, test/lint results) and stop. Perry reviews the branch and performs the merge himself.
- If you discover you are on `main` at any point, stop immediately, create a branch, and tell Perry before doing anything else.
- **`CLAUDE.md` is a governance document.** Fixing factual errors within an approved task scope is fine, but restructuring it, or adding/removing/altering any rules section (Autonomy Rules, Deployment, Git Rules, API Change Boundary), requires stopping and asking Perry first.
## API Change Boundary — clarification
 
"Extending an existing endpoint" **counts as an API change**. Any modification under `sniff-n-frolic-api/src` — including additive, backward-compatible changes like new optional query params or new optional fields — requires **stopping and summarizing the proposed change before implementing it**. Backward compatibility is Perry's call to confirm, not the agent's to assume: both `sniff-n-frolic-store` and `sniff-n-frolic-pos` consume this API.
 
## Code Style — hard rule
 
- Match the surrounding code's existing style exactly (quotes, semicolons, indentation).
- **Never run a formatter over an entire file.** Never reformat lines you are not functionally changing — formatting noise buries the real diff and breaks review.
- If the repo needs consistent formatting, propose adding a Prettier/ESLint config as its own separate task — do not impose formatting silently.