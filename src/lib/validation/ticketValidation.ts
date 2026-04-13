import { z } from "zod";
import type { AutomationTask, TicketFilters, TicketPriority, TicketStatus, TicketVisibility } from "../../types/models";
import { sanitizeId, sanitizeText } from "./sanitize";

const ticketTitleSchema = z
  .string()
  .trim()
  .min(3, "Ticket title is required.")
  .max(120, "Ticket title is too long.");

const ticketDescriptionSchema = z
  .string()
  .trim()
  .min(10, "Ticket description is required.")
  .max(2000, "Ticket description is too long.");

const ticketStatusSchema = z.enum(["backlog", "todo", "in_progress", "blocked", "review", "done"]);
const ticketPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
const ticketVisibilitySchema = z.enum(["private", "team", "public"]);
const labelsSchema = z.array(z.string().trim().min(1).max(24)).max(12);
const idSchema = z.string().trim().min(1).max(64);

export type CreateTicketInput = {
  title: string;
  description: string;
  initiativeId?: string;
  teamId?: string;
  assigneeId?: string;
  createdBy: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  visibility?: TicketVisibility;
  points?: number;
  labels?: string[];
  goalTitle?: string;
  goalTargetPoints?: number;
};

export const createTicketSchema = z.object({
  title: ticketTitleSchema,
  description: ticketDescriptionSchema,
  initiativeId: z.string().trim().max(64).optional().or(z.literal("")),
  teamId: z.string().trim().max(64).optional().or(z.literal("")),
  assigneeId: z.string().trim().max(64).optional().or(z.literal("")),
  createdBy: idSchema,
  status: ticketStatusSchema.default("todo"),
  priority: ticketPrioritySchema.default("medium"),
  visibility: ticketVisibilitySchema.default("team"),
  points: z.number().int().min(0).max(100).default(3),
  labels: labelsSchema.default([]),
  goalTitle: z.string().trim().max(120).optional().or(z.literal("")),
  goalTargetPoints: z.number().int().min(0).max(1000).optional(),
});

export const updateTicketSchema = z.object({
  title: ticketTitleSchema.optional(),
  description: ticketDescriptionSchema.optional(),
  initiativeId: z.string().trim().max(64).optional().or(z.literal("")),
  teamId: z.string().trim().max(64).optional().or(z.literal("")),
  assigneeId: z.string().trim().max(64).optional().or(z.literal("")),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  visibility: ticketVisibilitySchema.optional(),
  points: z.number().int().min(0).max(100).optional(),
  labels: labelsSchema.optional(),
  goalTitle: z.string().trim().max(120).optional().or(z.literal("")),
  goalTargetPoints: z.number().int().min(0).max(1000).optional(),
});

export const ticketFiltersSchema = z.object({
  search: z.string().trim().max(120).optional().or(z.literal("")),
  status: z.enum(["backlog", "todo", "in_progress", "blocked", "review", "done", "all"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical", "all"]).optional(),
  teamId: z.string().trim().max(64).optional().or(z.literal("all")),
  initiativeId: z.string().trim().max(64).optional().or(z.literal("all")),
});

export const automationTaskSchema = z.object({
  action: z.enum(["create_ticket", "update_ticket", "add_comment", "generate_docs", "generate_documentation", "bulk_create"]),
  payload: z.record(z.unknown()),
});

export const normalizeTicketFilters = (input: TicketFilters): TicketFilters => {
  const parsed = ticketFiltersSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "all", priority: "all", teamId: "all", initiativeId: "all", search: "" };
  }

  return {
    search: sanitizeText(parsed.data.search || "", 120),
    status: parsed.data.status || "all",
    priority: parsed.data.priority || "all",
    teamId: parsed.data.teamId || "all",
    initiativeId: parsed.data.initiativeId || "all",
  };
};

export const normalizeCreateTicketInput = (input: CreateTicketInput) => {
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid ticket payload.");
  }

  return {
    ...parsed.data,
    title: sanitizeText(parsed.data.title, 120),
    description: sanitizeText(parsed.data.description, 2000),
    initiativeId: sanitizeId(parsed.data.initiativeId || ""),
    teamId: sanitizeId(parsed.data.teamId || ""),
    assigneeId: sanitizeId(parsed.data.assigneeId || ""),
    labels: parsed.data.labels.map((label) => sanitizeText(label, 24)).filter(Boolean),
    goalTitle: sanitizeText(parsed.data.goalTitle || "", 120),
  };
};

export const normalizeUpdateTicketInput = (input: Record<string, unknown>) => {
  const parsed = updateTicketSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid ticket update.");
  }

  return {
    ...parsed.data,
    title: parsed.data.title ? sanitizeText(parsed.data.title, 120) : undefined,
    description: parsed.data.description ? sanitizeText(parsed.data.description, 2000) : undefined,
    initiativeId: parsed.data.initiativeId ? sanitizeId(parsed.data.initiativeId) : undefined,
    teamId: parsed.data.teamId ? sanitizeId(parsed.data.teamId) : undefined,
    assigneeId: parsed.data.assigneeId ? sanitizeId(parsed.data.assigneeId) : undefined,
    labels: parsed.data.labels?.map((label) => sanitizeText(label, 24)).filter(Boolean),
    goalTitle: parsed.data.goalTitle ? sanitizeText(parsed.data.goalTitle, 120) : undefined,
  };
};

export const normalizeAutomationTask = (input: unknown) => {
  const parsed = automationTaskSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid automation task.");
  }

  return parsed.data;
};
