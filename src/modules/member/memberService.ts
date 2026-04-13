import { hygraph as client } from "../../lib/hygraph";
import { gql } from "graphql-request";
import { AppUser } from "../../types/models";

/**
 * Service for managing the Global Member Directory and Networking.
 */
export const MemberService = {
  /**
   * Fetches all members in the organization directory.
   */
  async getDirectoryMembers(): Promise<AppUser[]> {
    const query = gql`
      query {
        appUsers(first: 1000) {
          id
          clerkId
          email
          name
          role
          department
          teams {
            id
            name
          }
        }
      }
    `;
    const res: any = await client.request(query);
    return res.appUsers || [];
  },

  /**
   * Deletes a member from the directory.
   */
  async deleteMember(id: string) {
    const mutation = gql`
      mutation ($id: ID!) {
        deleteAppUser(where: { id: $id }) {
          id
        }
      }
    `;
    return client.request(mutation, { id });
  },

  /**
   * Updates member details.
   */
  async updateMember(id: string, data: Partial<AppUser>) {
    const mutation = gql`
      mutation ($id: ID!, $data: AppUserUpdateInput!) {
        updateAppUser(where: { id: $id }, data: $data) {
          id
          name
          email
          role
          department
        }
        publishAppUser(where: { id: $id }) {
          id
        }
      }
    `;
    // Strip relational/computed fields that can't be set directly via update input
    const { id: _, teams: __, bio: _bio, skills: _skills, ...updateData } = data;
    return client.request(mutation, { 
      id, 
      data: updateData as any 
    });
  },

  /**
   * Bulk upserts members from a CSV import.
   * Matches by email to avoid duplicates.
   */
  async bulkUpsertMembers(members: Partial<AppUser>[]) {
    // Note: Hygraph doesn't have a native 'bulk upsert' mutation in the free tier
    // so we'll handle this as a sequence of operations or a batch mutation if possible.
    // For now, we'll implement it as a robust loop with publishing.
    const results = [];
    for (const member of members) {
      if (!member.email) continue;
      
      const mutation = gql`
        mutation($create: AppUserCreateInput!, $update: AppUserUpdateInput!, $email: String!) {
          upsertAppUser(
            where: { email: $email }
            upsert: {
              create: $create
              update: $update
            }
          ) {
            id
            email
          }
          publishAppUser(where: { email: $email }) {
            id
          }
        }
      `;
      try {
        const { email, ...updateData } = member;
        const res: any = await client.request(mutation, { 
          email: member.email,
          create: {
            ...member,
            role: member.role || "member"
          },
          update: {
            ...updateData,
            role: member.role || "member"
          }
        });
        results.push(res.upsertAppUser);
      } catch (err) {
        console.error(`Failed to upsert member ${member.email}:`, err);
      }
    }
    return results;
  },

  /**
   * Searches for people in the directory based on name or skills.
   */
  async searchMembers(searchTerm: string): Promise<AppUser[]> {
    const query = gql`
      query($term: String!) {
        appUsers(
          where: {
            OR: [
              { name_contains: $term }
            ]
          }
        ) {
          id
          name
          email
        }
      }
    `;
    const res: any = await client.request(query, { term: searchTerm });
    return res.appUsers || [];
  }
};
