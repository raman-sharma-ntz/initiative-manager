# Contributing

## Development Setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env` and configure values.
3. Run `pnpm dev`.

## Coding Standards

- Use App Router only.
- Use arrow functions for new and refactored code.
- Enforce RBAC and validation server-side for all protected/mutating paths.
- Use Zod schemas for server-side payload validation where practical.
- Keep business logic in service modules.

## Pull Request Checklist

- Include tests for changed business logic.
- Verify lint and typecheck pass.
- Verify tool agent JSON configs pass validation (`pnpm validate:agent-configs`).
- Verify the Husky pre-commit hook passes locally (`pnpm precommit`).
- Use conventional commit format: `type(scope): subject`.
- Allowed commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scope regex: lowercase alphanumeric with `.`, `_`, `/`, `-` separators.
- Update README and changelog for behavior changes.
- Avoid committing secrets or generated artifacts.
