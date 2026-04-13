# Engineering Guide for AI Agents

## Stack

- Next.js App Router + TypeScript
- Clerk for authentication and RBAC context
- React Query for client data workflows
- Server-first validation and sanitization

## Mandatory Patterns

- Use arrow functions for all new code.
- Keep business logic in `src/modules/*` or `src/lib/*`.
- Keep route handlers thin and delegate to services.
- Ensure all mutating handlers validate payload shape and business constraints.

## Code Quality

- Strong typing for exported functions and model boundaries.
- Keep public function signatures stable unless explicitly migrating.
- Add brief comments above business-critical logic only.

## App Router Conventions

- Use `src/app/**/page.tsx` for views.
- Use `src/app/api/**/route.ts` for server endpoints.
- Use server-side role checks for protected reads and writes.
