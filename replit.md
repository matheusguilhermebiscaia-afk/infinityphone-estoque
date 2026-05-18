# INFINITYPHONE ESTOQUE

Sistema completo de controle de estoque de celulares com vitrine digital para 3 lojas.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/infinityphone run dev` — run the frontend (port 23771)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — session secret (already set)
- Optional env: `ADMIN_PASSWORD` — admin password (default: `infinityphone2024`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session (auth)
- DB: PostgreSQL + Drizzle ORM
- Frontend: React + Vite + Tailwind CSS
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all contracts)
- `lib/db/src/schema/` — DB tables: `produtos.ts`, `estoque.ts`, `movimentacoes.ts`
- `artifacts/api-server/src/routes/` — Express route handlers: auth, produtos, movimentacoes, relatorios
- `artifacts/infinityphone/src/pages/` — React pages: Vitrine, AdminLogin, AdminDashboard, AdminProdutos, AdminProdutoNovo, AdminEntrada, AdminSaida, AdminHistorico, AdminRelatorios
- `artifacts/infinityphone/src/components/AdminLayout.tsx` — Admin sidebar/nav

## Architecture decisions

- Session-based auth with express-session; admin password stored in ADMIN_PASSWORD env var (default: infinityphone2024)
- Stock managed via `estoque` table (produto+loja unique pair), updated atomically on each `movimentacao`
- Numeric prices stored as `numeric` in Postgres, parsed to `float` in response serializers
- Public vitrine at `/` (no auth); all admin routes at `/admin/*` protected by client-side guard + server session
- Dark mode-only UI: black background (#050505), electric yellow-green accent (#D4FF00), white text

## Product

- **Public Vitrine** (`/`): Grid of phone cards with per-store stock badges (L1/L2/L3), filters by brand/model/price/store/chegou-hoje, sort controls
- **Admin Dashboard** (`/admin`): Stats cards, low-stock alerts, quick action buttons
- **Admin Produtos** (`/admin/produtos`): CRUD list with inline delete, links to edit form
- **Admin Entrada/Saida** (`/admin/entrada`, `/admin/saida`): Stock entry/exit forms with store selector and quantity stepper
- **Historico** (`/admin/historico`): Filterable movement log table
- **Relatorios** (`/admin/relatorios`): Tabbed reports — Entradas 7 dias, Vendas 7 dias por loja, Sem estoque, Valor por loja

## User preferences

- Language: Portuguese (Brazilian)
- Brand colors: #000 background, #D4FF00 accent, #FFFFFF text
- No emojis in UI

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- Price fields come from Postgres as strings (numeric type) — always `parseFloat()` before returning
- Admin password default is `infinityphone2024` — change via ADMIN_PASSWORD env var in production

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
