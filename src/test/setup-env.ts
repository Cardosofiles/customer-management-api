// Vitest runs this before any test module is imported (see `setupFiles` in
// vitest.config.ts). `src/config/env.ts` validates `process.env` at import time
// and calls `process.exit(1)` on any missing var, so the test env must be fully
// populated *before* `@/app.js` is loaded. These values mirror the CI "test"
// job (.github/workflows/ci.yml) to keep local and CI runs identical.
//
// `??=` only fills gaps: a developer's own `.env`/shell overrides are preserved,
// matching dotenv's non-override semantics.
process.env.NODE_ENV ??= 'test';
process.env.APP_NAME ??= 'management-customer-api';
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/management_customer?schema=public';
process.env.JWT_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
process.env.BETTER_AUTH_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3333';
process.env.RESEND_API_KEY ??= 're_ci_smoke_placeholder';
process.env.EMAIL_FROM ??= 'ci@example.com';
// The CORS suite asserts this exact allowed origin.
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
