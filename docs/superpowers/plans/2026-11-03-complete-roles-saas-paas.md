# Complete Multi-Role SaaS & Semi-PaaS Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and polish complete, production-grade pages and workflows for all 4 roles (Superadmin, Developer, Owner, Cashier), remove demo login shortcuts, integrate `@fk0u/ruas` code intelligence graph, and deploy all features to AWS EC2.

**Architecture:**
- Platform-level isolation with TenantScope and cryptographic `SupportDelegationToken` (Shopify Collaborator / AWS AssumeRole pattern).
- Semi-PaaS layer for developers with API Keys, HMAC-SHA256 Webhook delivery simulator, and interactive REST playground.
- Frontend: Inertia React 19 + TypeScript + Tailwind CSS v4, Lucide icons (Zero Emoji Policy), Navy Blue theme (`#0f2b5c`).
- Codebase Architecture Graph: `@fk0u/ruas` integration for AST graph analysis, blast-radius dependency tracing, and continuous health auditing.

**Tech Stack:** Laravel 11, PHP 8.4, Inertia.js React 19, PostgreSQL 16, Redis, Docker, `@fk0u/ruas`.

---

## Global Constraints
- Zero Emoji Policy: Absolutely zero emojis anywhere in UI or backend code; use Lucide icons exclusively.
- Year: 2026. Accent color: Navy Blue (`#0f2b5c`).
- Language: Polite, non-technical Bahasa Indonesia for tenant & cashier facing copy; clear technical English/Indonesian for Developer Hub.
- Data Sovereignty: Superadmin cannot read tenant financial/transaction data without active delegation token.
- High accessibility & ergonomics: One-hand operation on mobile/tablet, full screen modal coverage, virtual numeric keyboard.

---

## Task Breakdown

### Task 1: Initialize @fk0u/ruas Code Intelligence & Clean Up Login AuthCard
- [x] Integrate `@fk0u/ruas` CLI and AST graph database in `.ruas/`.
- [x] Add `ruas:index`, `ruas:status`, `ruas:audit`, and `ruas:lint` scripts to `package.json`.
- [x] Remove persona demo quick-login buttons (`selectPersona`) and default prefilled credentials from `AuthCard.tsx`.
- [x] Verify login form works with standard clean authentication inputs.

### Task 2: Superadmin Platform Sovereign Hub Completion
- [x] Telemetry monitor (CPU, memory, Redis cache, DB connection pool).
- [x] Tenant management actions: toggle tenant status (Active/Suspended), view tenant details.
- [x] Platform CS Support Tickets Center: view incoming tickets across tenants, respond in realtime, resolve tickets.
- [x] AssumeRole Token claim modal with immediate session delegation and clear visual exit banner.

### Task 3: Developer Hub (Semi-PaaS) Feature Expansion
- [x] API Key generation with custom scopes (`orders.read`, `products.read`, `webhooks.manage`) and secret key reveal modal.
- [x] Webhook registration, HMAC secret key generation, event selection (`order.completed`, `stock.low`, `shift.closed`).
- [x] Webhook Test Dispatcher / Simulator: send test ping to registered webhook endpoints and display response status, latency, and headers.
- [x] Interactive REST API Sandbox & Documentation with cURL copy snippets and JSON response schemas.

### Task 4: Cashier (Frontline POS) Complete Terminal Experience
- [x] Quick sale catalog with category filtering, instant search, and product images.
- [x] Cart management with discount, quantity adjustment, and loyalty points customer selection.
- [x] Fast tender cash buttons (+10k, +20k, +50k, +100k, Uang Pas) with on-screen virtual keyboard.
- [x] QRIS digital payment generator modal with countdown timer and payment simulator.
- [x] Shift Drawer reconciliation: Expected cash vs Actual cash counted with selisih calculations and shift close report.
- [x] Thermal receipt modal (58mm/80mm preview) and WhatsApp receipt sender modal.

### Task 5: Business Owner (Tenant Sovereign) Full Control Suite
- [x] Overview dashboard with GMV, gross margin, net profit, hourly sales chart, and low-stock alerts.
- [x] Product catalog with grid/list view toggle, stock opname / adjustment modal, add/edit product with HPP & selling price.
- [x] Cashflow & audit log of all shift drawer reconciliations across cashiers.
- [x] Customer CRM with loyalty point balance and point adjustment modal.
- [x] Financial & Tax Report with Profit & Loss summary (Pendapatan, HPP, Laba Kotor, Pengeluaran, Laba Bersih) and CSV/PDF export.
- [x] Pusat Bantuan with Customer Support live chat widget and Support Access Delegation Token generator.

### Task 6: Testing, Code Intelligence Verification & EC2 Deployment
- [x] Run `php artisan test` (verify all unit & feature tests pass).
- [x] Run `npm run build` and `npx @fk0u/ruas audit .` to verify architectural boundaries.
- [x] Deploy to AWS EC2 `ubuntu@13.228.178.42`.
- [x] Run database migrations, restart containers, and verify HTTPS endpoints on `https://pos.kousozo.tech`.
