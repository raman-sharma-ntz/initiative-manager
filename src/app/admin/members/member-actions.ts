"use server";

import { MemberService } from "../../../modules/member/memberService";
import { assertRole } from "../../../lib/auth/serverAuth";
import { revalidatePath } from "next/cache";
import { AppUser } from "../../../types/models";
import { clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { syncUser } from "../../../modules/cms/hygraph-users";

/**
 * Server Action to manually sync all users from Clerk to Hygraph.
 */
export async function syncAllUsersAction() {
  try {
    await assertRole(["admin"]);

    // 1. Fetch users from Clerk
    // Note: Handling basic pagination for up to 500 users for now.
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 500,
    });

    // 2. Process each user through the sync logic
    const syncPromises = clerkUsers.map(u => {
      const email = u.emailAddresses[0]?.emailAddress || "";
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || email;
      const role = u.publicMetadata.role as string | undefined;
      
      return syncUser({
        clerkId: u.id,
        email,
        name,
        role
      });
    });

    await Promise.all(syncPromises);

    revalidatePath("/admin/members");
    
    return { 
      success: true, 
      message: `Successfully synchronized ${clerkUsers.length} users with the directory.` 
    };
  } catch (error: any) {
    console.error("Global sync failed:", error);
    return { 
      success: false, 
      error: error.message || "Failed to synchronize users." 
    };
  }
}

/**
 * Server Action to invite a single member.
 * Sends a Clerk invitation email and creates a Hygraph record.
 */
export async function addSingleMemberAction(data: { name: string; email: string; role: string; department?: string }) {
  try {
    await assertRole(["admin"]);
    
    // Get the base URL (origin) to redirect users back to our app
    const origin = headers().get("origin") || "http://localhost:3000";
    const signUpUrl = `${origin}/sign-up`;

    // 1. Create/Update in Hygraph first to ensure directory is pre-populated
    await MemberService.bulkUpsertMembers([{
      name: data.name,
      email: data.email,
      role: data.role as any,
      department: data.department
    }]);

    // 2. Send Clerk Invitation with redirectUrl
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: data.email,
      publicMetadata: {
        role: data.role,
      },
      redirectUrl: signUpUrl,
      ignoreExisting: true
    });

    revalidatePath("/admin/members");
    
    return { 
      success: true, 
      message: `Invitation sent to ${data.email}. They will receive an email to set their password.` 
    };
  } catch (error: any) {
    console.error("Single member invite failed:", error);
    return { 
      success: false, 
      error: error.message || "Failed to invite member." 
    };
  }
}

/**
 * Server Action to bulk upload members from a CSV/Parsed array.
 * Restriced to Admins.
 */
export async function bulkUploadMembersAction(members: Partial<AppUser>[]) {
  try {
    await assertRole(["admin"]);
    
    // Perform bulk upsert
    const results = await MemberService.bulkUpsertMembers(members);
    
    revalidatePath("/admin/members");
    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      count: results.length,
      message: `Successfully processed ${results.length} members.` 
    };
  } catch (error: any) {
    console.error("Bulk upload action failed:", error);
    return { 
      success: false, 
      error: error.message || "Failed to process bulk upload." 
    };
  }
}

/**
 * Server Action to delete a member.
 */
export async function deleteMemberAction(id: string, clerkId?: string) {
  try {
    await assertRole(["admin"]);
    
    // 1. Delete from Hygraph
    await MemberService.deleteMember(id);
    
    revalidatePath("/admin/members");
    return { success: true };
  } catch (error: any) {
    console.error("Deletion failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to update a member.
 */
export async function updateMemberAction(id: string, clerkId: string | undefined, data: Partial<AppUser>) {
  try {
    await assertRole(["admin"]);

    // 1. Update in Hygraph
    await MemberService.updateMember(id, data);

    // 2. If role was changed and we have a clerkId, update Clerk metadata
    if (data.role && clerkId) {
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: {
          role: data.role,
        },
      });
    }

    revalidatePath("/admin/members");
    return { success: true };
  } catch (error: any) {
    console.error("Update failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the global directory for networking.
 * Available to Admins, Leads, and Members.
 */
export async function getDirectoryAction() {
  try {
    await assertRole(["admin", "lead", "member"]);
    return await MemberService.getDirectoryMembers();
  } catch (error) {
    console.error("Failed to fetch directory:", error);
    return [];
  }
}
