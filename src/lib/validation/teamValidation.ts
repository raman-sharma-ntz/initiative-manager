import type { Team, AppUser } from "../../types/models";
import { sanitizeEmail, sanitizeId, sanitizeText } from "./sanitize";
import { z } from "zod";

const TEAM_NAME_REGEX = /^[a-zA-Z0-9 .,'()&/-]{2,100}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const teamNameSchema = z
  .string()
  .min(2, "Team name required.")
  .max(100, "Team name too long.")
  .regex(TEAM_NAME_REGEX, "Team name contains invalid characters.");

const memberEmailSchema = z
  .string()
  .max(254, "Invalid email.")
  .regex(EMAIL_REGEX, "Invalid email.");

const idSchema = z.string().min(1, "Invalid id.").max(64, "Invalid id.");

const createTeamInputSchema = z.object({
  id: z.string().max(64).optional(),
  name: teamNameSchema,
  leadId: idSchema,
  memberIds: z.array(idSchema),
});

export type CreateTeamInput = {
  id?: string;
  name: string;
  leadId: string;
  memberIds: string[];
};

export const isValidTeamName = (name: string, teams: Team[]) => {
  const normalized = sanitizeText(name, 100);
  const result = teamNameSchema.safeParse(normalized);
  if (!result.success) {
    return { valid: false, reason: result.error.issues[0]?.message || "Team name required." };
  }

  if (teams.some(t => t.name.toLowerCase() === normalized.toLowerCase())) {
    return { valid: false, reason: "Duplicate team name." };
  }

  return { valid: true };
};

export const isValidMemberEmail = (email: string, users: AppUser[]) => {
  const normalized = sanitizeEmail(email);
  const result = memberEmailSchema.safeParse(normalized);
  if (!result.success) {
    return { valid: false, reason: result.error.issues[0]?.message || "Invalid email." };
  }

  if (users.some(u => u.email.toLowerCase() === normalized.toLowerCase())) {
    return { valid: false, reason: "Duplicate member email." };
  }

  return { valid: true };
};

export const normalizeTeamInput = (input: CreateTeamInput): CreateTeamInput => {
  const sanitized = {
    id: sanitizeId(input.id) || undefined,
    name: sanitizeText(input.name, 100),
    leadId: sanitizeId(input.leadId),
    memberIds: Array.from(new Set(input.memberIds.map(id => sanitizeId(id)).filter(Boolean))),
  };

  const parsed = createTeamInputSchema.safeParse(sanitized);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid team payload.";
    throw new Error(message);
  }

  return parsed.data;
};
