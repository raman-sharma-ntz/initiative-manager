import type { Role } from "./auth";

export interface AppUser {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  bio?: string;
  skills?: string[];
  department?: string;
  teams?: { id: string; name: string }[];
}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  memberIds: string[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
}

export type TicketStatus = "backlog" | "todo" | "in_progress" | "blocked" | "review" | "done";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type TicketVisibility = "private" | "team" | "public";

export interface TicketDoc {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: string; // Renamed from createdBy
}

export interface TicketGoal {
  id: string;
  title: string;
  targetPoints: number;
  achievedPoints: number;
}

export interface TicketComment {
  id: string;
  body: string;
  createdAt: string;
  author: string; // Renamed from createdBy
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  initiativeId?: string;
  teamId?: string;
  assigneeId?: string;
  author: string; // Renamed from createdBy
  ticketStatus: TicketStatus; // Renamed from status
  priority: TicketPriority;
  visibility: TicketVisibility;
  points: number;
  labels: string[];
  goal: TicketGoal;
  docs: TicketDoc[];
  comments: TicketComment[];
  watchers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  teamId?: string | "all";
  initiativeId?: string | "all";
}

export type AutomationAction =
  | "create_ticket"
  | "update_ticket"
  | "add_comment"
  | "generate_docs"
  | "generate_documentation"
  | "bulk_create";

export interface AutomationTask {
  action: AutomationAction;
  payload: Record<string, unknown>;
}