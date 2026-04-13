"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { syncUser } from "../../modules/cms/hygraph-users";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "../../types/auth";

/**
 * Server Action to complete onboarding by assigning the 'member' role.
 * This ensures the user exists in both Clerk (metadata) and Hygraph.
 */
export async function completeOnboarding() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if they already have a role to avoid double-processing
  const existingRole = user.publicMetadata.role as Role;
  if (existingRole) {
    return { success: true, role: existingRole };
  }

  const email = user.emailAddresses[0]?.emailAddress || "";
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || email;

  try {
    // 0. Timeout wrapper to prevent hanging actions
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms));

    const syncTask = (async () => {
      // 1. Sync to Hygraph - this now links invited users and returns their correct role
      const dbUser = await syncUser({
        clerkId: user.id,
        email,
        name,
      });

      const assignedRole = (dbUser?.role as Role) || "member";

      // 2. Update Clerk publicMetadata with the actual role from DB
      await clerkClient.users.updateUser(user.id, {
        publicMetadata: {
          role: assignedRole,
        },
      });
      
      revalidatePath("/");
      return { success: true, role: assignedRole };
    })();

    // Race the sync task against a 15s timeout
    return await Promise.race([syncTask, timeout(15000)]) as { success: boolean; role: Role };
  } catch (error: any) {
    console.error("Onboarding failed:", error);
    if (error.message === "TIMEOUT") {
      return { success: false, error: "The setup process is taking longer than expected. Please refresh and try again." };
    }
    return { success: false, error: "Failed to sync user data. Please try again or contact support." };
  }
}
