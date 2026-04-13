import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import type { Role } from "../types/auth";
import { getRoleFromClaims } from "../lib/auth/roles";

export const requireRole = (role: Role) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const { userId, sessionClaims } = getAuth(req);
    const userRole = getRoleFromClaims(sessionClaims);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (userRole === role) return next();
    res.status(403).json({ error: "Forbidden" });
  };
};