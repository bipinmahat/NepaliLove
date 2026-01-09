# GitHub Copilot instructions for NepaliLove

Purpose: give AI coding agents the minimal, high-value context to be productive in this repository. Keep changes small and targeted — prefer short PRs that change one concern at a time.

Quick architecture
- Full-stack single-repo app: Express server and Vite React client. The server serves both API and client in development (middleware) and production (static build).
- Realtime: WebSocket server in `server/routes.ts` handles chat at `/ws` (currently accepts unauthenticated connections; prefer adding session-based auth).
- DB: PostgreSQL using Drizzle ORM. Schema lives in `shared/schema.ts`. Migrations live under `migrations/` and use standard SQL files (drizzle-kit push).
- Sessions: Postgres-backed session store (table `sessions`) configured in `server/replitAuth.ts`.

Important developer workflows
- Install: `npm install`
- Dev: `npm run dev` (starts Express server with Vite middleware; app served at port 5000 by default)
- Build: `npm run build` then `npm run start` (server serves `dist/public`)
- Type-check: `npm run check` (tsc)
- DB migrations: `npm run db:push` (drizzle-kit)

Project-specific conventions & patterns
- One server process serves API + client (not separate dev servers). When editing server and client together, use `npm run dev`.
- Env vars live in `.env` (ignored by Git). Required vars: `DATABASE_URL`, `SESSION_SECRET`. Optional Replit OIDC vars: `REPLIT_DOMAINS`, `ISSUER_URL`, `REPL_ID`.
- Use `@` alias for client imports and `@shared` for shared types/schema.
- Avoid logging raw responses or PII: `server/index.ts` currently captures response JSON for logging — prefer removing or redacting sensitive fields.
- DB uniqueness: prefer database-level constraints for entities that represent undirected pairs (matches, conversations). See `migrations/20260109_add_unique_constraints.sql` for an example using `LEAST/GREATEST` indexes.

Integration points & gotchas
- WebSockets: `server/routes.ts` broadcasts messages to all connected clients. When adding features, scope broadcasts to conversations and authenticate on connection.
- File uploads: saved to `uploads/` and served statically at `/uploads`. Multer filters by MIME type only — validate file signatures and add access control for sensitive files.
- Auth: Replit OIDC integration in `server/replitAuth.ts`. `isAuthenticated` middleware expects session cookie; refresh tokens handled on-demand.
- Storage: `server/storage.ts` contains the canonical DB access methods. Keep logic there (unit of work) to avoid duplicating queries and race conditions.

Examples for quick reference
- Get current user: GET `/api/auth/user` (needs session cookie; server returns `{ profile, hasProfile }`). See `server/routes.ts`.
- Create/update profile: POST/PUT `/api/profile` (multipart form for photos/video, multer configured in routes).
- WebSocket messages: connect to `ws(s)://<host>/ws` and send JSON messages (server currently rebroadcasts).

What to avoid and why
- Do not introduce console logging that prints user data or raw responses (this repo has several `console.log` calls; prefer a structured logger with redaction).
- Avoid changing database schema without adding a migration file to `migrations/` and running `npm run db:push`.
- Avoid assuming separate client dev server — `npm run dev` is the primary developer entry point.

When making PRs
- Keep PRs focused: e.g., "add unique DB constraints" or "authenticate WebSocket connections".
- Add a small migration for any schema change and document the reason in the migration file name.
- When touching uploads, add file signature checks and unit tests for the storage layer behaviors.

If anything in this file looks incomplete or you want more examples (end-to-end tests, CI checks, or logger migration), say which area to expand.
