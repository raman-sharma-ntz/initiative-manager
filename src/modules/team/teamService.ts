"use server";
import { Team, AppUser } from "../../types/models";
import {
  isValidMemberEmail,
  isValidTeamName,
  normalizeTeamInput,
  type CreateTeamInput,
} from "../../lib/validation/teamValidation";
import { sanitizeEmail, sanitizeId, sanitizeText } from "../../lib/validation/sanitize";

import { hygraph } from "../../lib/hygraph";
import { gql } from "graphql-request";

export const getTeams = async (): Promise<Team[]> => {
  const query = gql`
    query GetTeams {
      teams {
        id
        name
        lead { clerkId id }
        members { clerkId id }
      }
    }
  `;
  const res = await hygraph.request<{ teams: any[] }>(query);
  return res.teams.map(t => ({
    id: t.id,
    name: t.name,
    leadId: t.lead?.clerkId,
    memberIds: t.members?.map((m: any) => m.clerkId) || [],
  }));
};

export const createTeam = async (input: Team | CreateTeamInput) => {
  const normalized = normalizeTeamInput(input as CreateTeamInput);
  
  const mutation = gql`
    mutation CreateTeam($data: TeamCreateInput!) {
      createTeam(data: $data) {
        id
      }
      publishTeam(where: { id: "REPLACED" }) { id }
    }
  `;

  // Filter out any empty/invalid member IDs
  const memberClerkIds = Array.from(new Set([normalized.leadId, ...normalized.memberIds])).filter(Boolean);

  const data = {
    name: normalized.name,
    lead: { connect: { clerkId: normalized.leadId } },
    members: { connect: memberClerkIds.map(id => ({ clerkId: id })) }
  };

  const res = await hygraph.request<{ createTeam: any }>(
    gql`mutation CreateTeam($data: TeamCreateInput!) { createTeam(data: $data) { id } }`,
    { data }
  );

  await hygraph.request(gql`mutation { publishTeam(where: { id: "${res.createTeam.id}" }) { id } }`);

  return { id: res.createTeam.id, ...normalized };
};

export const getUsers = async (): Promise<AppUser[]> => {
  const query = gql`
    query GetUsers {
      appUsers {
        clerkId
        name
        email
        role
        teams { id }
      }
    }
  `;
  const res = await hygraph.request<{ appUsers: any[] }>(query);
  return res.appUsers.map(u => ({
    id: u.clerkId, // Using clerkId as id for consistency with previous mock pattern if needed, or u.id if preferred.
    clerkId: u.clerkId,
    name: u.name,
    email: u.email,
    role: u.role,
    teamId: u.teams?.[0]?.id,
  }));
};

export const getUserById = async (userId: string): Promise<AppUser | null> => {
  const query = gql`
    query GetUser($clerkId: String!) {
      appUser(where: { clerkId: $clerkId }) {
        clerkId
        name
        email
        role
        teams { id }
      }
    }
  `;
  const res = await hygraph.request<{ appUser: any }>(query, { clerkId: userId });
  if (!res.appUser) return null;
  const u = res.appUser;
  return {
    id: u.clerkId,
    clerkId: u.clerkId,
    name: u.name,
    email: u.email,
    role: u.role,
    teamId: u.teams?.[0]?.id,
  };
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const query = gql`
    query GetTeam($id: ID!) {
      team(where: { id: $id }) {
        id
        name
        lead { clerkId }
        members { clerkId }
      }
    }
  `;
  const res = await hygraph.request<{ team: any }>(query, { id: teamId });
  if (!res.team) return null;
  const t = res.team;
  return {
    id: t.id,
    name: t.name,
    leadId: t.lead?.clerkId,
    memberIds: t.members?.map((m: any) => m.clerkId) || [],
  };
};

export const getTeamsCached = async (): Promise<Team[]> => {
  return getTeams();
};