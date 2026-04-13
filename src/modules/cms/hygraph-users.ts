import { hygraph as client } from "../../lib/hygraph";
import { gql } from "graphql-request";
import { Role } from "../../types/auth";

// Assuming Hygraph has an AppUser model (using 'AppUser' to avoid 'User' reserved word conflict, or 'User' if configured).
// In instructions, the model is simply named 'User'.
export const getUserByClerkId = async (clerkId: string) => {
  const query = gql`
    query ($clerkId: String!) {
      appUser(where: { clerkId: $clerkId }) {
        id
        clerkId
        email
        name
        role
      }
    }
  `;
  const res: any = await client.request(query, { clerkId });
  return res.appUser;
};

export const syncUser = async (data: { clerkId: string; email: string; name: string; role?: string }) => {
  // 1. Check if user already exists by CLERK ID
  const existingByClerk = await getUserByClerkId(data.clerkId);
  if (existingByClerk) {
    return existingByClerk;
  }

  // 2. Check if user was INVITED (has email but no clerkId)
  const queryByEmail = gql`
    query ($email: String!) {
      appUser(where: { email: $email }) {
        id
        clerkId
        email
        role
      }
    }
  `;
  const resByEmail: any = await client.request(queryByEmail, { email: data.email });
  const existingByEmail = resByEmail.appUser;

  if (existingByEmail) {
    // LINK: Update existing record with the new clerkId
    // If a role was provided by clerk (passed in data), we could update it too, 
    // but usually we trust the directory role more. For now, just link.
    const linkMutation = gql`
      mutation ($id: ID!, $clerkId: String!) {
        updateAppUser(where: { id: $id }, data: { clerkId: $clerkId }) {
          id
          clerkId
          role
        }
        publishAppUser(where: { id: $id }) {
          id
        }
      }
    `;
    const resLink: any = await client.request(linkMutation, { 
      id: existingByEmail.id, 
      clerkId: data.clerkId 
    });
    return resLink.updateAppUser;
  }

  // 3. If totally new, create the record
  const mutation = gql`
    mutation ($data: AppUserCreateInput!, $clerkId: String!) {
      createAppUser(data: $data) {
        id
        clerkId
        role
      }
      publishAppUser(where: { clerkId: $clerkId }) {
        id
      }
    }
  `;
  
  try {
    const res: any = await client.request(mutation, { 
      data: { 
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        role: (data.role as any) || "member" 
      },
      clerkId: data.clerkId 
    });
    return res.createAppUser;
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      return getUserByClerkId(data.clerkId);
    }
    throw error;
  }
};

export const updateUserRole = async (clerkId: string, role: string) => {
  const mutation = gql`
    mutation ($clerkId: String!, $role: Role!) {
      updateAppUser(where: { clerkId: $clerkId }, data: { role: $role }) {
        id
        role
      }
      publishAppUser(where: { clerkId: $clerkId }) {
        id
      }
    }
  `;
  const res: any = await client.request(mutation, { clerkId, role });
  return res.updateAppUser;
};
