# Copilot Instructions

## Project Defaults

- Use Next.js App Router patterns only.
- Use arrow functions for all newly written code.
- Enforce RBAC server-side for protected routes and actions.
- Validate and sanitize all input in server paths.

## Security Defaults

- Never trust client-side role checks for authorization.
- Return 401 for unauthenticated requests and 403 for unauthorized requests.
- Avoid exposing secrets, tokens, or raw internal errors in responses.

## Data and Validation

- Keep validation in reusable modules under `src/lib/validation`.
- Keep domain logic in `src/modules` and avoid duplicating logic in UI files.

## Documentation Defaults

- Update README and changelog when behavior or architecture changes.
- Keep `.github` governance docs synchronized with actual workflows.
- Keep `agents/ENGINEERING.md` and `agents/TESTING.md` as the source of truth for agent guidance.
- Avoid duplicating identical policy text in tool-specific folders; prefer thin compatibility files that point back to the shared docs.
