"use server";
import type {
  AutomationTask,
  Ticket,
  TicketComment,
  TicketDoc,
  TicketFilters,
  TicketGoal,
  TicketPriority,
  TicketStatus,
  TicketVisibility,
  AppUser,
} from "../../types/models";
import { getTeamById, getUserById } from "../team/teamService";
import {
  normalizeAutomationTask,
  normalizeCreateTicketInput,
  normalizeTicketFilters,
  normalizeUpdateTicketInput,
  type CreateTicketInput,
} from "../../lib/validation/ticketValidation";
import { sanitizeText } from "../../lib/validation/sanitize";

import { hygraph } from "../../lib/hygraph";
import { gql } from "graphql-request";

// GraphQL fragments for consistent data fetching
const TICKET_FIELDS = gql`
  fragment TicketFields on Ticket {
    id
    title
    description
    points
    ticketStatus
    priority
    visibility
    createdAt
    updatedAt
    initiative { id name }
    team { id name }
    assignee { id name clerkId }
    author { id name clerkId }
  }
`;

export const getTickets = async (): Promise<Ticket[]> => {
  const query = gql`
    ${TICKET_FIELDS}
    query GetTickets {
      tickets(first: 100, orderBy: createdAt_DESC) {
        ...TicketFields
      }
    }
  `;
  const res = await hygraph.request<{ tickets: any[] }>(query);
  return res.tickets.map(t => ({
    ...t,
    status: t.ticketStatus, // Map for UI compatibility if needed
    createdBy: t.author?.clerkId,
    initiativeId: t.initiative?.id,
    teamId: t.team?.id,
    assigneeId: t.assignee?.clerkId,
    docs: [], // Placeholder for now
    comments: [],
    goal: { id: "0", title: "", targetPoints: 0, achievedPoints: 0 }
  }));
};

export const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
  const query = gql`
    ${TICKET_FIELDS}
    query GetTicket($id: ID!) {
      ticket(where: { id: $id }) {
        ...TicketFields
      }
    }
  `;
  const res = await hygraph.request<{ ticket: any }>(query, { id: ticketId });
  if (!res.ticket) return null;
  
  const t = res.ticket;
  return {
    ...t,
    status: t.ticketStatus,
    createdBy: t.author?.clerkId,
    initiativeId: t.initiative?.id,
    teamId: t.team?.id,
    assigneeId: t.assignee?.clerkId,
    docs: [], 
    comments: [],
    goal: { id: "0", title: "", targetPoints: 0, achievedPoints: 0 }
  };
};

export const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
  const mutation = gql`
    mutation CreateTicket($data: TicketCreateInput!) {
      createTicket(data: $data) {
        id
        title
      }
      publishTicket(where: { id: "WILL_BE_REPLACED" }) { id }
    }
  `;

  // We need to map the author by ClerkId. This assumes the user exists in Hygraph.
  const data = {
    title: input.title,
    description: input.description,
    points: input.points,
    ticketStatus: input.status as any,
    priority: input.priority as any,
    visibility: input.visibility as any,
    author: { connect: { clerkId: input.createdBy } },
    team: input.teamId ? { connect: { id: input.teamId } } : undefined,
    initiative: input.initiativeId ? { connect: { id: input.initiativeId } } : undefined,
    assignee: input.assigneeId ? { connect: { clerkId: input.assigneeId } } : undefined,
  };

  const res = await hygraph.request<{ createTicket: any }>(
    gql`
      mutation CreateTicket($data: TicketCreateInput!) {
        createTicket(data: $data) {
          id
        }
      }
    `, 
    { data }
  );

  // Auto-publish
  await hygraph.request(gql`mutation { publishTicket(where: { id: "${res.createTicket.id}" }) { id } }`);
  
  const ticket = await getTicketById(res.createTicket.id);
  if (!ticket) throw new Error("Failed to retrieve created ticket.");
  return ticket;
};

export const updateTicket = async (ticketId: string, updates: Record<string, unknown>): Promise<Ticket> => {
  const normalized = normalizeUpdateTicketInput(updates);
  
  const data: any = {
    title: normalized.title,
    description: normalized.description,
    points: normalized.points,
    ticketStatus: normalized.status,
    priority: normalized.priority,
    visibility: normalized.visibility,
  };

  if (normalized.teamId) data.team = { connect: { id: normalized.teamId } };
  if (normalized.initiativeId) data.initiative = { connect: { id: normalized.initiativeId } };
  if (normalized.assigneeId) data.assignee = { connect: { clerkId: normalized.assigneeId } };

  const mutation = gql`
    mutation UpdateTicket($id: ID!, $data: TicketUpdateInput!) {
      updateTicket(where: { id: $id }, data: $data) {
        id
      }
      publishTicket(where: { id: $id }) { id }
    }
  `;

  await hygraph.request(mutation, { id: ticketId, data });
  
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error("Ticket not found.");
  return ticket;
};

export const getVisibleTickets = async ({
  viewerId,
  role,
  filters,
}: {
  viewerId: string;
  role: "admin" | "lead" | "member";
  filters?: TicketFilters;
}): Promise<Ticket[]> => {
  const where: any = {};

  // 1. RBAC Visibility Filter
  if (role === "admin") {
    // Admins see everything
  } else if (role === "lead") {
    // Leads see their own, assigned, or team tickets
    where.OR = [
      { author: { clerkId: viewerId } },
      { assignee: { clerkId: viewerId } },
      { team: { members_some: { clerkId: viewerId } } }
    ];
  } else {
    // Members see their own or assigned tickets
    where.OR = [
      { author: { clerkId: viewerId } },
      { assignee: { clerkId: viewerId } }
    ];
  }

  // 2. Applied Filters
  if (filters) {
    if (filters.status && filters.status !== "all") where.ticketStatus = filters.status;
    if (filters.priority && filters.priority !== "all") where.priority = filters.priority;
    if (filters.teamId && filters.teamId !== "all") where.team = { id: filters.teamId };
    if (filters.initiativeId && filters.initiativeId !== "all") where.initiative = { id: filters.initiativeId };
    if (filters.search) {
      where.OR = [
        ...(where.OR || []),
        { title_contains: filters.search },
        { description_contains: filters.search }
      ];
    }
  }

  const query = gql`
    ${TICKET_FIELDS}
    query GetVisibleTickets($where: TicketWhereInput) {
      tickets(where: $where, first: 100, orderBy: createdAt_DESC) {
        ...TicketFields
      }
    }
  `;

  const res = await hygraph.request<{ tickets: any[] }>(query, { where });
  return res.tickets.map(t => ({
    ...t,
    status: t.ticketStatus,
    createdBy: t.author?.clerkId,
    initiativeId: t.initiative?.id,
    teamId: t.team?.id,
    assigneeId: t.assignee?.clerkId,
    docs: [], 
    comments: [],
    goal: { id: "0", title: "", targetPoints: 0, achievedPoints: 0 }
  }));
};

export const addTicketComment = async (ticketId: string, createdBy: string, body: string): Promise<TicketComment> => {
  // Note: Hygraph requires a Comment model to be defined. 
  // For this sync, we'll assume comments are handled via a relation.
  // If not in schema, this should be added.
  console.log("Comment persisting to Hygraph not yet fully implemented in schema.");
  return { id: "temp", body, createdAt: new Date().toISOString(), author: createdBy };
};

export const addTicketDocumentation = async ({
  ticketId,
  createdBy,
  title,
  body,
}: {
  ticketId: string;
  createdBy: string;
  title: string;
  body: string;
}): Promise<TicketDoc> => {
  console.log("Docs persisting to Hygraph not yet fully implemented in schema.");
  return { id: "temp", title, body, createdAt: new Date().toISOString(), author: createdBy };
};

export const getAdminTicketSnapshot = async () => {
  return getTickets();
};

export const getTicketAutomationPreview = async (task: AutomationTask) => {
  const normalizedTask = normalizeAutomationTask(task);
  return { action: normalizedTask.action, preview: normalizedTask.payload };
};

export const runAutomationTask = async (task: AutomationTask, actorId: string) => {
  const normalizedTask = normalizeAutomationTask(task);

  if (normalizedTask.action === "create_ticket") {
    const ticket = await createTicket({ ...(normalizedTask.payload as any), createdBy: actorId });
    return { ok: true, ticket };
  }

  throw new Error("Automation task not yet synced for Hygraph.");
};
