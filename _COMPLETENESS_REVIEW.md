# Completeness Review: akarsuadvisory

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 100 project files (86 source files), 2 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Functional but incomplete**

This is a substantive but unfinished application workflow application, not just an empty scaffold. Inspection found 86 source files across `frontend/`, `backend/` using Next.js, React, Express, Prisma; however, the checked-in workflow and delivery controls do not yet demonstrate a complete, production-operable product.

## Why it is not complete

- Generated gap/visualization routes describe missing capabilities or simulate recommendations; they do not implement the underlying domain operation.
- Generic LLM calls are used as product behavior without enough typed tools, grounded evidence, deterministic rules, or output evaluation.
- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Define the primary user and acceptance criteria, then complete one end-to-end workflow against persistent data instead of demo fixtures.
2. Replace mocks, placeholders, and generic AI responses with validated domain services and explicit failure/retry behavior.
3. Implement secure identity, role/tenant boundaries, input validation, secrets handling, and auditable state changes.
4. Add representative automated tests, CI quality gates, environment documentation, migrations, observability, backup, and deployment configuration.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Credential/configuration exposure: environment files are present in the repository tree and must be checked against Git history and rotated if real.
- Weak/fallback secret patterns can permit forged sessions or accidental insecure deployments.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.

## Evidence inspected

- `backend/middleware/auth.js:2`
- `frontend/src/App.jsx:28`
- `backend/server.js`
- `backend/middleware/auth.js`
- `backend/package.json`
- `docker-start.sh`

## Recommended next action

Choose one real application workflow journey, define acceptance criteria and external contracts, then close its persistence, permission, integration, failure, and test gaps before expanding features.

## Implementation progress (2026-07-19)

Implemented a bounded advisory-engagement journey from consented public inquiry through deterministic qualification, provider-backed discovery scheduling, recorded discovery, typed proposal authoring, independent manager approval, provider-backed proposal generation/delivery, single-use expiring client acceptance or decline, and CRM-confirmed kickoff. Client identity/contact data, discovery notes, proposal content, and provider payloads are encrypted with versioned AES-256-GCM keys and tenant/case authenticated context; queue views expose only a one-way client token. Internal identities are tenant-scoped, database-backed, bcrypt-hashed, and protected by strict short-lived JWT algorithm/issuer/audience/ID claims and role-bound optimistic workflow transitions. All state changes write append-only audit events.

Removed the production dependency on unvalidated generic AI lead scoring and plaintext email notifications for the primary journey. Added exact-schema calendar, document, messaging, and CRM operations; encrypted durable outbox payloads; stable idempotency keys; leases with expired-lease recovery; bounded retry/backoff and dead letters; fixed-endpoint provider delivery; receipt validation; and signed replay-protected provider callbacks. The public booking page now submits the governed intake contract with explicit contact consent, timeline, and budget inputs. The production admin surface is the governed pipeline, while generated/gap/AI routes and navigation are development-only. Database, authentication, encryption, CORS, startup, readiness, Docker, and dependency configuration now fail closed; startup/container startup no longer install, seed, create databases, rewrite credentials, migrate, or kill unrelated processes.

Added the additive PostgreSQL governance migration, 9 unit/provider/failure tests, a full HTTP/PostgreSQL integration test, CI migration/build/test/audit gates, environment documentation, and a deployment/backup/monitoring/key-rotation/incident runbook. Final verification applied the migration twice on a disposable PostgreSQL 16 database and passed all 10 tests including the complete role/provider/client/tenant journey, the production Vite build, `git diff --check`, and backend/frontend dependency audits with zero findings; the disposable database was removed. Local `.env` files are ignored and no `.env` path appears in Git history; any credential ever used beyond local development still requires external rotation. Real provider conformance, representative user/client validation, proposal legal review, production SSO/MFA, privacy/security assessment, backup restore, observability integrations, and organizational incident approval remain external launch gates rather than source-code gaps.

## Runtime verification (2026-07-20)

- `start.sh` now requires the assigned API port, refuses conflicts, uses acceptance environment values before project files, derives only test-environment encryption configuration from the supplied secret, and launches the real source tree from the isolated fixture.
- Added an explicit guarded administrator provisioner using bcrypt cost 12. Login accepts the configured public tenant when a tenant field is omitted, issues the existing issuer/audience-bound short-lived JWT, and `/api/auth/me` reloads the active tenant identity from PostgreSQL.
- First acceptance passed on fresh PostgreSQL `55628`, API `6070`, and reserved UI `6071` as `startup_login_session_api`; the migration and explicit provisioner ran outside startup, and all ports were released afterward.
- Nine unit/provider/failure tests passed with the database integration test correctly skipped without its opt-in database URL; backend syntax checks, the Vite production build, launcher syntax, and whitespace validation passed.
