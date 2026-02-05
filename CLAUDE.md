# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIS System - A Management Information System for IT asset and inventory management. Monorepo with a Laravel 12 API backend and a React 19 SPA frontend.

## Development Commands

### Run both servers (from root):
```bash
npm run dev
```
This uses `concurrently` to start the Laravel API server and the Vite dev server together.

### Backend only (from `backend/`):
```bash
php artisan serve                  # Start API server (port 8000)
php artisan migrate                # Run database migrations
php artisan migrate:rollback       # Rollback last migration
php artisan test                   # Run PHPUnit tests
composer test                      # Same as above (clears config first)
php artisan tinker                 # Interactive REPL
php artisan route:list             # List all registered routes
./vendor/bin/pint                  # Run Laravel Pint code formatter
```

### Frontend only (from `frontend/`):
```bash
npm run dev                        # Start Vite dev server (port 5173)
npm run build                      # Production build to dist/
npm run lint                       # Run ESLint
npm run preview                    # Preview production build
```

### Initial setup (from `backend/`):
```bash
composer setup
```
This installs dependencies, copies `.env`, generates app key, runs migrations, and builds frontend assets.

## Architecture

### Backend (`backend/`)

**Framework:** Laravel 12, PHP 8.2+, PostgreSQL

**Authentication:** Laravel Sanctum token-based auth. Tokens expire after 7 days. Auth endpoints rate-limited to 5 req/min.

**Key architectural patterns:**

- **Service layer** (`app/Services/`): Business logic for dashboard statistics (`DashboardService`), QR code generation via external API (`QRCodeMonkeyService`), and audit logging (`InventoryAuditLogService`).
- **Observer pattern** (`app/Observers/`): Nearly every model has an observer that handles audit logging and cache invalidation (via `DashboardCacheObserver`). When adding a new model, register its observer in `AppServiceProvider`.
- **Middleware** (`app/Http/Middleware/`): `ForceJsonResponse` ensures all API responses are JSON. `SecurityHeaders` adds security headers. `ApiLogger` logs API requests.
- **All routes** are in `routes/api.php`. Most use `apiResource()` for standard CRUD, with custom routes for specialized operations (bulk delete, status updates, QR generation, etc.).
- **Response format:** Controllers return JSON with `{ success: bool, data: ..., message: ... }` structure.

**Asset system specifics:**
- Assets have a global scope for auto-depreciation calculation (straight-line method) applied on every query.
- `AssetMovement` tracks the full audit trail: assignments, transfers, returns, repairs, status changes.
- `AssetComponent` handles sub-components (e.g., PC parts like RAM, SSD) with their own movement tracking.
- Soft deletes are used on `AssetMovement` and `AssetComponent`.

### Frontend (`frontend/`)

**Stack:** React 19, Vite (via rolldown-vite), Tailwind CSS 3, Material Tailwind for UI components.

**Key architectural patterns:**

- **API client** (`src/services/apiClient.js`): Axios instance with interceptors that auto-attach Bearer token from `localStorage` and redirect to login on 401.
- **Service layer** (`src/services/`): One service file per backend resource (e.g., `assetCategoryService.js`, `repairService.js`). Each exports functions that call `apiClient`.
- **Server state** managed with `@tanstack/react-query`. Use query keys and mutations consistently.
- **Forms** use `react-hook-form` + `zod` for validation.
- **Auth context** (`src/context/AuthContext.jsx`): Provides `user`, `login`, `logout`, `register` via React Context.
- **Routing** (`src/routes/`): Split into `inventoryRoutes`, `adminRoutes`, `helpdeskRoutes`. Pages are lazy-loaded. Protected routes wrap with `ProtectedRoute` component.
- **Layouts** (`src/layouts/`): Auth pages use `AuthLayout`, main app uses inventory/admin layouts with sidebar navigation.
- **Client-side exports**: PDF generation via `jspdf`/`jspdf-autotable`, Excel via `xlsx-js-style`.
- **Build splitting**: `vite.config.js` has manual chunk splitting for vendor bundles (react, material-tailwind, tanstack, charts, etc.).

### Database

PostgreSQL. Connection config is in `backend/.env`. Migrations are in `backend/database/migrations/` (35+ migrations).

Key entity relationships:
- `Asset` belongs to `Employee`, `Branch`, `Status`, `Vendor`, `Equipment`, `AssetCategory`
- `Asset` has many `AssetComponent` (for desktop PCs)
- `Asset` has many `AssetMovement` (audit trail)
- `Employee` belongs to `Branch`, `Section`, `Position`
- `Repair` belongs to `Asset`, has many `RepairRemark`
- `Replenishment` is a separate reserve/spare inventory that can be assigned to employees or branches

## Conventions

- Backend API prefix: `/api/` (all routes)
- Frontend dev server proxies nothing; it calls the API directly at `http://localhost:8000/api`
- CORS configured in `backend/config/cors.php` for `localhost:5173` (dev) and production domains
- Frontend uses JSX (not TSX), though `src/types/` contains some type definition files
- Component files use PascalCase, service/utility files use camelCase
