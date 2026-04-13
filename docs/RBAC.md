# RBAC & Security Documentation

> **Disclaimer:** This project is purely made with AI, code reviewed by @raman-sharma-ntz, done by AI and no code written.

This document outlines the Role-Based Access Control (RBAC) architecture, security practices, and administrative tools for the Initiative Manager project.

## 1. Role Definitions

| Role | Access Level | Description |
| :--- | :--- | :--- |
| `admin` | Full | Access to all tickets, team management, exports, and assistant tools. |
| `lead` | Management | Access to team-specific tickets and assistant tools. |
| `member` | Contributor | Access to assigned tickets. Default role for all new users. |

## 2. Authentication Flow

The project uses **Clerk** (Google OAuth) for authentication and **Hygraph** for data persistence.

### Onboarding & Auto-Assignment
New users are automatically directed to the `/onboarding` flow upon their first sign-in. This flow:
1.  Creates a user record in Hygraph.
2.  Assigns the `member` role to the user's `publicMetadata` in Clerk.
3.  Ensures consistent state across both platforms.

## 3. Route Protection

### Middleware
Routes are protected at the edge in `src/middleware.ts`. 
- `/admin/*` is restricted to users with the `admin` role.
- All non-public routes require a valid session and an assigned role.

### Server-Side Guards
In Server Components and Server Actions, use the following helpers from `@/lib/auth/serverAuth`:
- `requireAuth()`: Ensures user is signed in.
- `requireAdmin()`: Redirects to `/403` if not an admin.
- `assertRole(['admin', 'lead'])`: Throws a 403 error (useful for API routes).

## 4. Administrative Tools

### Seeding an Admin
To grant administrative access to a user, use the provided seeder script. You must have the `CLERK_SECRET_KEY`, `HYGRAPH_ENDPOINT`, and `HYGRAPH_TOKEN` environment variables set.

```bash
# Using Email
ADMIN_EMAIL=admin@example.com node scripts/seed-admin.mjs

# Using Clerk User ID
CLERK_USER_ID=user_2lV... node scripts/seed-admin.mjs
```

## 5. Security Best Practices

- **Never Hardcode Roles**: Always use the `ROLES` constant from `@/types/auth`.
- **Fail Closed**: Middleware and API guards should deny access by default if a role or user is not validated.
- **Metadata Source of Truth**: Clerk's `publicMetadata` is the primary source of truth for the current session's role to ensure edge-compatibility. Hygraph acts as the persistent database for relationship management.

## 6. Production Checklist

- [ ] Ensure Clerk Webhook secrets are set (if using webhooks).
- [ ] Verify that `publicMetadata` is enabled in Clerk Session Claims.
- [ ] Run `seed-admin.mjs` for your initial admin account.
- [ ] Verify that `/api/auth/assign-role` has been removed.
