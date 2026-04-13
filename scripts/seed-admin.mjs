import "dotenv/config";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { GraphQLClient, gql } from "graphql-request";

/**
 * Seed Admin Script
 * Usage: CLERK_USER_ID=user_xxx node scripts/seed-admin.mjs
 * Or: ADMIN_EMAIL=email@example.com node scripts/seed-admin.mjs
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const HYGRAPH_ENDPOINT = process.env.HYGRAPH_ENDPOINT;
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

if (!CLERK_SECRET_KEY || !HYGRAPH_ENDPOINT || !HYGRAPH_TOKEN) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
const hygraph = new GraphQLClient(HYGRAPH_ENDPOINT, {
  headers: { Authorization: `Bearer ${HYGRAPH_TOKEN}` },
});

async function seed() {
  const userId = process.env.CLERK_USER_ID;
  const email = process.env.ADMIN_EMAIL;

  if (!userId && !email) {
    console.error("Please provide either CLERK_USER_ID or ADMIN_EMAIL.");
    process.exit(1);
  }

  try {
    let user;
    if (userId) {
      console.log(`Fetching user by ID: ${userId}...`);
      user = await clerk.users.getUser(userId);
    } else {
      console.log(`Fetching user by email: ${email}...`);
      const { data } = await clerk.users.getUserList({ emailAddress: [email] });
      user = data[0];
    }

    if (!user) {
      console.error("User not found in Clerk.");
      process.exit(1);
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // 1. Update Clerk Metadata
    console.log("Updating Clerk publicMetadata to 'admin'...");
    await clerk.users.updateUser(user.id, {
      publicMetadata: {
        role: "admin",
      },
    });

    // 2. Sync to Hygraph
    console.log("Syncing to Hygraph...");
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || userEmail;

    const upsertMutation = gql`
      mutation UpsertAppUser($clerkId: String!, $email: String!, $name: String!) {
        upsertAppUser(
          where: { clerkId: $clerkId }
          upsert: {
            create: { clerkId: $clerkId, email: $email, name: $name, role: admin }
            update: { role: admin }
          }
        ) {
          id
          role
        }
        publishAppUser(where: { clerkId: $clerkId }) {
          id
        }
      }
    `;

    await hygraph.request(upsertMutation, {
      clerkId: user.id,
      email: userEmail,
      name: userName,
    });

    console.log("✅ Successfully seeded admin user!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
