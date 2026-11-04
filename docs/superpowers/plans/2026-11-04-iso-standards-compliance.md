# ISO Standards Compliance & System Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform QLon Enterprise POS & CRM SaaS to strictly adhere to international enterprise standards (ISO/IEC 27001:2022 Information Security, ISO/IEC 27701:2019 / UU PDP Data Privacy, ISO 22301:2019 Business Continuity, and ISO/IEC 25010:2023 Software Quality) seamlessly in the application architecture, removing superficial UI governance badges and embedding real security controls under the hood.

**Architecture:** Implement comprehensive, transparent controls directly into the Laravel backend and React/Inertia frontend. This includes SHA-256 backup archive checksum verification, strict tenant isolation verification middleware, tamper-evident audit log hashing, automated data masking for customer PII, rate-limiting & session security hardening, and safe user-facing incident reference codes.

**Tech Stack:** Laravel 12 (PHP 8.4), MySQL 8 (InnoDB), React 19, TypeScript, Inertia.js, Tailwind CSS, PHPUnit.

**Spec:** Standardized Multi-Tenant Enterprise Security & ISO Compliance Specification.

---

## Global Constraints

- Never expose superficial or decorative "Banking Governance" pages in the UI; all compliance mechanisms must operate under the hood with clear, actionable system logs.
- Strictly maintain database table prefix safety (`DB_PREFIX=qlon_`).
- All cryptographic operations must use standard algorithms (AES-256-GCM via Laravel Crypt, SHA-256 for hashes and checksums).
- All customer PII (phone numbers, full addresses) must be masked in platform-level logs and administrative views.
- Zero breaking changes to existing POS Cashier and CRM business workflows.

---

## Review Focus

1. **Backup Integrity (ISO 22301)**: Corrupted or truncated backup files during snapshot generation must be detected immediately via SHA-256 validation.
2. **Tenant Data Segregation (ISO 27001 A.8.2)**: Direct object reference attempts across tenants (e.g. querying another tenant's order or customer by ID) must fail closed with 404 or 403.
3. **Audit Log Tamper-Resistance (ISO 27001 A.8.15)**: Audit log entries must contain immutable timestamps, actor IDs, client IPs, and payload hashes.
4. **PII Masking (ISO 27701 / UU PDP No. 27/2022)**: Phone numbers and personal identification must be masked (e.g. `0812****7890`) when surfaced in audit trails or non-delegated admin views.
5. **Secure Failure & Error Handling (ISO 25010)**: 500 error pages must never disclose SQL queries, file paths, or stack traces to end-users; only an Incident Reference UUID is displayed.

---

## Tasks

### Task 1: Remove Superficial Governance Page & Redirect Routes

**Files:**
- Modify: `resources/js/Components/app/app-shell.tsx`
- Modify: `resources/js/Pages/Superadmin/SuperadminNav.tsx`
- Modify: `resources/js/Pages/Superadmin/Dashboard.tsx`
- Modify: `routes/web.php`
- Modify: `tests/Feature/SuperAdminAccessTest.php`

- [x] Remove "Tata Kelola Perbankan" navigation link from desktop and mobile sidebars in `app-shell.tsx`.
- [x] Remove "Tata Kelola Perbankan" tab from `SuperadminNav.tsx`.
- [x] Remove "Tata Kelola Korporat Perbankan" card from `Dashboard.tsx`.
- [x] Add 302 redirect from `/superadmin/governance` to `/superadmin` in `routes/web.php`.
- [x] Update test assertions in `tests/Feature/SuperAdminAccessTest.php` to verify the redirect.
- [x] Run `php artisan test` and `npm run build` to verify clean build and test pass.

---

### Task 2: Backup Integrity Verification & Checksum Hashing (ISO 22301)

**Files:**
- Modify: `app/Services/BackupService.php`
- Create: `app/Console/Commands/VerifyBackupsCommand.php`
- Test: `tests/Feature/BackupIntegrityTest.php`

- [ ] Write failing test in `tests/Feature/BackupIntegrityTest.php` verifying that when a backup is created, an accompanying `.sha256` checksum is stored and verified.
- [ ] Update `app/Services/BackupService.php` to compute and record `hash_file('sha256', $backupPath)` upon snapshot creation, storing it in snapshot metadata or alongside the file.
- [ ] Implement `app/Console/Commands/VerifyBackupsCommand.php` (`php artisan system:backup-verify`) which checks the SHA-256 checksum and gzip archive validity of all retained snapshots.
- [ ] Run `php artisan test --filter=BackupIntegrityTest` to confirm all assertions pass.
- [ ] Commit with message: `feat(iso-22301): implement backup sha256 checksum generation and integrity verification command`.

---

### Task 3: PII Masking and Data Privacy Safeguards (ISO 27701 & UU PDP)

**Files:**
- Create: `app/Support/PiiSanitizer.php`
- Modify: `app/Models/AuditLog.php`
- Modify: `app/Services/IncidentTracker.php`
- Test: `tests/Unit/PiiSanitizerTest.php`

- [ ] Write unit test `tests/Unit/PiiSanitizerTest.php` testing phone number masking (e.g. `081234567890` -> `0812****7890`), email masking (`user@example.com` -> `u***@example.com`), and credit/debit card masking.
- [ ] Implement `app/Support/PiiSanitizer.php` with static methods `maskPhone(?string $phone)`, `maskEmail(?string $email)`, and `sanitizePayload(array $data)`.
- [ ] Update `IncidentTracker::capture` to automatically pipe request payload parameters through `PiiSanitizer::sanitizePayload()` before writing to `system_incidents` table.
- [ ] Update `AuditLog` logging helpers to ensure customer phone numbers or sensitive payload parameters are masked at recording time.
- [ ] Run `php artisan test --filter=PiiSanitizerTest` to confirm tests pass.
- [ ] Commit with message: `feat(iso-27701): implement pii sanitizer for audit logs and incident tracker`.

---

### Task 4: Security Headers and Session Lockout Hardening (ISO 27001 A.8.1 & A.8.20)

**Files:**
- Create: `app/Http/Middleware/SecurityHeadersMiddleware.php`
- Modify: `bootstrap/app.php`
- Modify: `config/session.php`
- Test: `tests/Feature/SecurityHeadersTest.php`

- [ ] Write feature test `tests/Feature/SecurityHeadersTest.php` asserting that all responses contain:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
  - `Content-Security-Policy` with appropriate script and style directives.
- [ ] Create `app/Http/Middleware/SecurityHeadersMiddleware.php` injecting enterprise security headers.
- [ ] Register `SecurityHeadersMiddleware` in `bootstrap/app.php` within web middleware group.
- [ ] Configure `config/session.php` with `secure => env('SESSION_SECURE_COOKIE', true)`, `http_only => true`, and `same_site => 'lax'`.
- [ ] Run `php artisan test --filter=SecurityHeadersTest` and verify all headers pass.
- [ ] Commit with message: `feat(iso-27001): enforce strict security headers and session cookie protection`.

---

### Task 5: End-User Error Masking with UUID Incident Code (ISO 25010)

**Files:**
- Modify: `bootstrap/app.php`
- Modify: `resources/js/Pages/Errors/500.tsx` (or dedicated error page component)
- Test: `tests/Feature/IncidentMaskingTest.php`

- [ ] Write test `tests/Feature/IncidentMaskingTest.php` simulating an internal 500 error and verifying that the user response does not leak database details or stack trace, but outputs an incident tracking UUID.
- [ ] In `bootstrap/app.php`, update the exception handler render callback: when an unhandled server error occurs, pass the generated incident `uuid` to the Inertia 500 view.
- [ ] Update the 500 error page to display: "Kode Referensi Insiden: [UUID]" and button to copy code for easy reference when contacting IT support.
- [ ] Run `php artisan test --filter=IncidentMaskingTest` to verify.
- [ ] Commit with message: `feat(iso-25010): mask server errors with incident tracking uuid on 500 pages`.

---

### Task 6: Production VPS Verification & Deployment

**Files:**
- Production VPS deployment script / execution

- [ ] Execute `npm run build` locally.
- [ ] Execute full suite `php artisan test` to confirm all 60+ tests pass.
- [ ] Push to `origin main`.
- [ ] Deploy to VPS (`istanadev@157.10.161.42` at `/srv/www/production/pos-qlon`) via git pull and `php artisan optimize`.
- [ ] Verify live site `https://qloop.id` via curl and browser test.

