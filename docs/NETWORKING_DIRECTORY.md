# Strategic Networking & Directory

> **Disclaimer:** This project is purely made with AI, code reviewed by @raman-sharma-ntz, done by AI and no code written.

The Initiative Manager application features a robust, decentralized "Networking & Directory" suite. This system bridges the gap between individual identity management (via Clerk) and organizational data structure (via Hygraph), allowing your team to collaborate seamlessly while maintaining strict administrative oversight.

## 🧭 The Global Member Directory
Access the directory at `/admin/members`. This is the organization's central talent pool and source of truth for all resource assignments.

**Features:**
- **Full-Cycle Management**: Edit user names, roles, or departments. Delete users completely.
- **Team Visibility**: See exactly which collaborative networks (teams) a user belongs to in real-time.
- **Dual Onboarding**:
  - **Quick Invite**: Send a single Clerk invitation to a new user and assign them a role (`Member`, `Lead`, `Admin`).
  - **Bulk Import**: Upload a CSV to pre-stage hundreds of users at once.

### Identity Linking (Match-on-Join)
The system uses "Intelligent Identity Linking" to solve the gap between invited emails and active Clerk accounts:
1. When you invite a user or upload a CSV, a record is created in the Hygraph database linked to their email.
2. The user receives a Clerk invitation and clicks the link to sign up.
3. During the `completeOnboarding` process (handled in `/app/onboarding/onboarding-action.ts`), the `syncUser` service intercepts the request.
4. The service performs an email lookup in Hygraph, finds the pre-staged profile, and **claims** it by permanently linking their new Clerk ID.
5. The pre-assigned Role (e.g., `Lead`) is extracted from the database and injected into the user's Clerk security metadata.

### The "Force Sync" Utility
Found at the top of the Member Directory, the **Sync with Clerk** button provides a disaster recovery and auditing tool:
- Clicking this button will pull your entire user list directly from Clerk.
- It verifies each user against the Hygraph directory.
- **Role-Aware Continuity**: If a user's role has been changed directly in the Clerk dashboard, the manual sync prioritizes the Clerk metadata and updates the Hygraph directory to match effortlessly.

## 🤝 Collaborative Networks (Team Hub)
Access the networking hub at `/teams`. This decentralized dashboard encourages cross-organization collaboration while providing varying levels of control based on authority.

**Features:**
- **Discovery**: All users can view all active teams in the organization, see who the Lead is, and jump into the team's Project Board.
- **Spearheading Initiatives**: Users with the `Lead` or `Admin` role have access to the "Launch Network" tools. They can create new teams and immediately recruit specialists directly from the global directory.
- **Admin Oversight**: Administrators see an "Admin Oversight" badge on the dashboard. They can view, manage, and monitor all teams regardless of whether they are a direct participant.

### Technical Architecture
- **Server Actions First**: All mutations (`addSingleMemberAction`, `updateMemberAction`, `createTeamAction`) are strictly handled server-side to prevent key leakage.
- **RBAC Protected**: Every action enforces the `assertRole` check, restricting access to authorized paths.
- **Idempotent Mutations**: Database operations are strictly idempotent (e.g., using `upsert` queries and fallback logic) to prevent duplication during heavy network loads or double-clicks.
