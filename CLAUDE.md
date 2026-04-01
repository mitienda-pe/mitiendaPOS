# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite) with API proxy to api2.mitienda.pe
npm run build    # Production build
npm run preview  # Preview production build locally
```

Deploy: `git push origin main` (Netlify auto-deploys).

No test runner or linter is configured in this project.

## Architecture

Vue 3 Point-of-Sale application using Options-style Pinia stores, Vue Router, and TailwindCSS. All source is JavaScript (not TypeScript, except `src/types/billing.ts`). Uses `<script setup>` in Vue components.

### Two Auth Flows

1. **Admin login** (`/login`): Email + password -> Token #1 -> store selection -> Token #2 (scoped to store)
2. **Cashier login** (`/cashier-login`): Store ID + 4-digit PIN -> pre-scoped token (no store selection)

Tokens stored in `localStorage` as `access_token` / `refresh_token`. The auth store (`src/stores/auth.js`) manages both flows.

### Two Axios Instances

- `src/api/axios.js` — Simple instance, used by some older code. Base URL from `VITE_API_URL`.
- `src/services/axios.js` — Primary instance (`apiClient`), used by all `src/services/*Api.js` files. Has token refresh logic and response normalization (`{ error: 0 }` -> `{ success: true }`). Base URL from `VITE_API_BASE_URL`. **Use this one for new code.**

### Pinia Stores (`src/stores/`)

- **auth** — Login, token management, user/store selection, role checks (`cajero`, `supervisor`, `administrador`)
- **cart** — Sale lifecycle with states: ABIERTO -> BLOQUEADO (partial payment) -> PAGADO -> FINALIZADO. PIN authorization for edits in blocked state.
- **shift** — Cash register shift (turno de caja). POS route requires active shift (`requiresActiveShift` guard).
- **cashier** — Cash movements within a shift
- **billing** — Billing document types (boleta/factura)
- **inventory**, **customers**, **savedSales** — Domain data

### Service Layer (`src/services/*Api.js`)

Each API domain has its own service file that wraps `apiClient` calls. All services import from `src/services/axios.js`.

### Route Guards

Router enforces: authentication, role-based access (`meta.roles`), and active shift requirement for POS view. Unauthenticated users redirect to `/cashier-login` (not `/login`).

### Key Domain Concepts

- **Shift (turno)**: Must open a shift before using POS. Shift tracks cash movements, opening/closing balances.
- **Billing documents**: `boleta` (receipt) vs `factura` (invoice) — Peruvian tax document types.
- **Cart states**: Cart transitions through ABIERTO/BLOQUEADO/PAGADO/FINALIZADO. Supervisor PIN required for certain operations on blocked carts.
- **Rounding**: Cash payments may have rounding adjustments (Peruvian currency).
- **NetSuite integration**: Optional sync for branches, users, cashier accounts, stock, and calculated totals.

### Printing

Thermal receipt printing via QZ Tray (`src/services/qzTrayService.js`) and `@point-of-sale/receipt-printer-encoder`. Receipt layout built by `src/services/receiptBuilder.js`.

### External API Proxies (dev only)

Vite proxies `/api` to `api2.mitienda.pe`, `/api-reniec` and `/api-sunat` to `apis.net.pe` (Peruvian government ID/tax lookups). Token for apis.net.pe comes from `VITE_APISNET_TOKEN`.

## Conventions

- UI language is Spanish (es-PE locale)
- Color primary: `#00b2a6` (turquoise) — use `text-primary`, `bg-primary`
- Use `AppButton`, `AppInput`, `AppBadge`, `AppEmptyState`, `AppErrorState` from `@/components/ui`
- Do NOT use `indigo-*` or `blue-*` for interactive elements
- Icons: `@heroicons/vue`
- Commits: conventional commits (`feat:`, `fix:`, etc.)
- New API services go in `src/services/` using `apiClient` from `src/services/axios.js`
