import { AppUser } from "../types/models";
import type { Role } from "../types/auth";

export const userHasRole = (user: AppUser, requiredRole: Role) => {
  return user.role === requiredRole;
};