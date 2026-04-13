import type { Role } from "../../types/auth";
import { ROLES } from "../../types/auth";

export const getRoleFromClaims = (claims: any): Role | null => {
  // Clerk stores metadata in publicMetadata or unsafeMetadata. 
  // We prefer publicMetadata for RBAC.
  const metadata = claims?.publicMetadata || claims?.metadata || {};
  const role = metadata.role as string;

  if (ROLES.includes(role as Role)) {
    return role as Role;
  }

  return null;
};
