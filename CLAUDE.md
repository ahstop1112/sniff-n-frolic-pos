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
npm run lint           # ESLint
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
- **WooCommerce**: `ProductsModule` syncs products from `https://sniffnfrolic.com/wp-json/wc/v3`.
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
WOO_API_BASE_URL=https://sniffnfrolic.com/wp-json/wc/v3
WOO_CONSUMER_KEY=...
WOO_CONSUMER_SECRET=...
```

## Key Patterns

- **Zustand stores** are the source of truth for client-side state (auth token, active session/shift, orders).
- **TanStack Query** handles server state and caching for data fetching.
- **Feature flags** are managed server-side via the `feature_flags` table and exposed through `FeatureFlagsModule`.
- Migrations are plain SQL files applied manually — there is no migration runner.
