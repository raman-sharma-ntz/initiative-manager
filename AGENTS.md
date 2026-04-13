# AGENTS

This file defines shared behavior for AI assistants working in this repository.

## Scope

- This repository is App Router only. Do not create or modify `src/pages` routes.
- Security-sensitive checks must run on the server, not client-only.
- Role-based access control (RBAC) must be enforced in route handlers, middleware, or server actions.

## Engineering Rules

- Use TypeScript with explicit types for exported APIs.
- Prefer arrow functions for all components, route handlers, and utilities.
- Keep modules small and domain-oriented (`src/modules/*`, `src/lib/*`).
- Validate and sanitize all external input before persistence or third-party calls.

## Testing Rules

- Add or update tests for business-critical changes.
- Cover RBAC and validation edge cases for any new mutation route.
- For integration tests, verify unauthorized access returns 401/403.

## Security Rules

- Never commit secrets. Use `.env` and documented placeholders.
- Add `Cache-Control: no-store` for sensitive API responses where appropriate.
- Fail closed: deny access when role/user checks are missing or malformed.

## Docs Rules

- Update README and changelog for major behavior changes.
- Keep `.github` process docs in sync with implementation.
