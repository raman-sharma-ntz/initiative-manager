"use server";

import { createTeam, getTeams } from "../../modules/team/teamService";
import { assertRole } from "../../lib/auth/serverAuth";
import { revalidatePath } from "next/cache";

/**
 * Server Action for decentralized team creation.
 * Allows Admins and Leads to build teams.
 */
export async function createTeamAction(data: { name: string; memberIds: string[] }) {
  try {
    const { userId } = await assertRole(["admin", "lead"]);
    
    const team = await createTeam({
      name: data.name,
      leadId: userId,
      memberIds: Array.from(new Set([...data.memberIds, userId])), // Ensure creator is in the team
    });

    revalidatePath("/teams");
    revalidatePath("/dashboard");
    
    return { success: true, team };
  } catch (error: any) {
    console.error("Team creation failed:", error);
    return { success: false, error: error.message || "Failed to create team." };
  }
}

/**
 * Fetches all teams for the User Dashboard.
 */
export async function getTeamsAction() {
  try {
    await assertRole(["admin", "lead", "member"]);
    return await getTeams();
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return [];
  }
}
