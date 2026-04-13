export type Role = "admin" | "lead" | "member";

export const ROLES: Role[] = ["admin", "lead", "member"];

export interface UserMetadata {
  role?: Role;
}
