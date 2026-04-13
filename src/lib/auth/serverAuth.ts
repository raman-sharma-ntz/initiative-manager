import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Role } from "../../types/auth";
import { ROLES } from "../../types/auth";
import { getUserByClerkId } from "../../modules/cms/hygraph-users";
import { cache } from "react";

/**
 * Gets the current user and their role.
 * Role Priority: Clerk publicMetadata > Hygraph DB > Default null
 */
export const getCurrentUserWithRole = cache(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return { userId: null, role: null };

  // 1. Check Clerk publicMetadata
  let role = clerkUser.publicMetadata.role as Role;

  // 2. If not in Clerk, check Hygraph (as fallback or for sync verification)
  if (!role || !ROLES.includes(role)) {
    try {
      const dbUser = await getUserByClerkId(clerkUser.id);
      if (dbUser?.role && ROLES.includes(dbUser.role as Role)) {
        role = dbUser.role as Role;
      }
    } catch (error) {
      console.error("Hygraph lookup failed in getCurrentUserWithRole:", error);
    }
  }

  return { 
    userId: clerkUser.id, 
    role: role && ROLES.includes(role) ? role : null,
    user: clerkUser 
  };
});

export const requireAuth = async () => {
  const { userId, role, user } = await getCurrentUserWithRole();
  if (!userId) redirect("/sign-in");
  return { userId, role, user };
};

export const requireAdmin = async () => {
  const { userId, role } = await requireAuth();
  if (role !== "admin") redirect("/403");
  return { userId, role };
};

/**
 * Throws errors instead of redirecting. Useful for API routes.
 */
export const assertSignedIn = async () => {
  const { userId, role } = await getCurrentUserWithRole();
  if (!userId) {
    const error = new Error("UNAUTHENTICATED");
    (error as any).status = 401;
    throw error;
  }
  return { userId, role };
};

export const assertRole = async (allowed: Role[]) => {
  const { userId, role } = await assertSignedIn();
  if (!role || !allowed.includes(role)) {
    const error = new Error("FORBIDDEN");
    (error as any).status = 403;
    throw error;
  }
  return { userId, role };
};
