# Initiative Manager

> **Disclaimer:** This project is purely made with AI, code reviewed by @raman-sharma-ntz, done by AI and no code written.

Initiative Manager is a secure, modular Next.js App Router project with RBAC, validation/sanitization, CMS integration, and Excel export workflows.

## Features

- App Router-first architecture (no Pages Router routes)
- Clerk authentication with server-side RBAC enforcement
- Team and admin workflows through route handlers and services
- Ticket management with goals, points, docs, filtering, and search
- Role-aware visibility: upper roles can see everything
- JSON-driven AI assistant for automation-style tasks
- Google OAuth from Clerk for Drive upload and Sheets export
- AI documentation generation in markdown/html/json/text with optional Drive upload
- Hygraph integration for program content
- Excel export pipeline with cloud upload extension points
- Strong validation and sanitization in server paths
- Zod-based schema validation for server-side payload checks
- Arrow-function coding style across the codebase

## Getting Started

1. Install dependencies: `pnpm install`
2. Configure environment values in `.env` (see `.env.example`)
3. Start development server: `pnpm dev`
4. Run quality checks:
	- `pnpm lint`
	- `pnpm typecheck`

## Security & RBAC

This project uses a robust Role-Based Access Control system integrated with Clerk and Hygraph. 
See [docs/RBAC.md](./docs/RBAC.md) for full details on roles, permissions, and administrative tools.

- **Admin Seeding**: Run `ADMIN_EMAIL=your@email.com node scripts/seed-admin.mjs` to bootstrap your first admin.
- **Onboarding**: Every new user is automatically assigned the `member` role upon signup via the `/onboarding` flow.

### Environment keys used by the app

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `HYGRAPH_ENDPOINT`
- `HYGRAPH_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `AI_ASSISTANT_PROVIDER`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `AI_ASSISTANT_FALLBACK`
- `AI_ASSISTANT_ENABLED`

## Security Baseline

- Gemini is the primary prompt planner; local JSON execution is the resilient fallback.

## Strategic Networking & Directory

The application features a production-hardened Directory and Team management suite designed for decentralized organizational networks:
- **Global Member Directory**: A centralized talent pool with support for Bio, Skills, and Departments.
- **Advanced Identity Linking**: When an invited user signs up via Clerk, the `syncUser` service automatically links their new Clerk account to their pre-existing Hygraph directory record by email, preserving assigned roles.
- **Role-Aware Sync**: Admins can force a manual synchronization via the "Sync with Clerk" tool ensuring that roles (`Lead`, `Admin`) assigned within Clerk are flawlessly mirrored to Hygraph.
- **Full-Cycle Directory Management**: Delete or edit a member's name, role, or department directly from the directory table. Role changes are synced back to Clerk Public Metadata automatically.
- **Collaborative Networks & Team Hub**: A decentralized team-building interface. **Leads** and **Admins** have explicit authority to launch new initiatives and recruit members from the Directory, while members enjoy a focused discovery view.

See [docs/NETWORKING_DIRECTORY.md](./docs/NETWORKING_DIRECTORY.md) for full usage instructions and architectural details.

## Google + Docs APIs

- `POST /api/google/export`: Export team data to Google Drive (`destination=drive`) or Google Sheets (`destination=sheets`) using Clerk Google OAuth token.
- `POST /api/docs/generate`: Generate documentation via assistant in `markdown`, `html`, `json`, or `text`, optionally attach to ticket and upload to Drive.

## AI Agent Docs

### Global Agent Files

- `AGENTS.md`: shared AI behavior and security guardrails
- `agents/ENGINEERING.md`: engineering implementation guidance
- `agents/TESTING.md`: testing and regression guidance

### Tool-Specific Agent Folders

- `.cursor/agent-config.json`
- `.antigravity/agent-config.json`
- `.gemini/agent-config.json`
- `.claude/agent-config.json`

These tool-specific JSON files are intentionally thin compatibility shims. The shared source of truth is `agents/ENGINEERING.md` and `agents/TESTING.md`, plus `AGENTS.md` for always-on workspace rules.

## Git Hooks

- `pnpm precommit` runs agent-config validation, lint, and typecheck.
- Husky runs that command automatically before commits.
- Husky also runs commit-message validation with a regex.
- Commit format: `type(scope): subject`
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Scope regex: lowercase alphanumeric with `.`, `_`, `/`, `-` separators

## Ticket Workflow

- Admin users can view every ticket across initiatives and teams.
- Leads and members see scoped tickets based on role, team, and ownership.
- Each ticket can carry a goal, points, labels, comments, and generated docs.
- The JSON assistant can create, update, or document tickets using structured payloads.

## Governance and Process Docs

See `.github/README.md` for the index. Key files include:

- `.github/copilot-instructions.md`
- `.github/CHANGELOG.md`
- `.github/CONTRIBUTING.md`
- `.github/ISSUES.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/SECURITY.md`
- `.github/CODE_OF_CONDUCT.md`
- `.github/SUPPORT.md`