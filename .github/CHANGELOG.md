# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- App Router-only migration by removing `src/pages` routes.
- Server-side RBAC helpers and secure route checks.
- Input sanitization and stronger validation utilities.
- AI collaboration docs for Copilot, Cursor, Claude, Gemini, and Antigravity.
- Husky pre-commit hook for lint and typecheck enforcement.
- Husky commit-msg hook with regex validation for new commit messages.
- Pre-commit validation for `.claude`, `.cursor`, `.gemini`, and `.antigravity` `agent-config.json` files.
- Zod integration for server validation and pre-commit validator scripts.
- Ticket management system with role-aware visibility, filters, search, points, goals, docs, and comments.
- JSON-driven AI assistant route for automation-style task execution.

### Changed

- Converted existing code to arrow function style.
- Strengthened API security headers and authorization behavior.
- Replaced duplicated per-tool agent markdown files with thin JSON compatibility configs.
- Tightened commit message regex validation rules.
