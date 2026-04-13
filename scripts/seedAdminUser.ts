import "dotenv/config";
import { GraphQLClient, gql } from "graphql-request";

const endpoint = process.env.HYGRAPH_ENDPOINT;
const token = process.env.HYGRAPH_TOKEN;
const clerkSecret = process.env.CLERK_SECRET_KEY;

if (!endpoint || !token || !clerkSecret) {
  console.error("Missing required environment variables. Ensure HYGRAPH_ENDPOINT, HYGRAPH_TOKEN, and CLERK_SECRET_KEY are in your .env");
  process.exit(1);
}

const client = new GraphQLClient(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
});

async function run() {
  const emailArgs = process.argv.slice(2);
  if (emailArgs.length === 0) {
    console.log("Usage: npx tsx scripts/seedAdminUser.ts <admin@example.com>");
    process.exit(1);
  }

  const email = emailArgs[0];
  console.log(`Starting admin seeder for email: ${email} ...`);

  try {
    // 1. Fetch user from Clerk using standard REST API (bypasses SDK issues & deprecation)
    const clerkRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${clerkSecret}` }
    });

    if (!clerkRes.ok) {
      throw new Error(`Failed to fetch from Clerk API: ${clerkRes.status} ${clerkRes.statusText}`);
    }

    const clerkUserList = await clerkRes.json();
    const clerkUser = clerkUserList[0];

    if (!clerkUser) {
      console.error(`Error: User with email ${email} not found in Clerk.`);
      console.error("Please ensure the email is exactly as it appears in your Clerk dashboard.");
      process.exit(1);
    }

    const clerkId = clerkUser.id;
    const firstName = clerkUser.first_name;
    const lastName = clerkUser.last_name;
    
    console.log(`‚úÖ Found Clerk User - ID: ${clerkId}`);

    // 2. Format name
    const fullname = `${firstName || ""} ${lastName || ""}`.trim() || email;

    // 3. Upsert into Hygraph as Admin
    const query = gql`
      query ($clerkId: String!) {
        user(where: { clerkId: $clerkId }) {
          id
          role
        }
      }
    `;
    const checkRes: any = await client.request(query, { clerkId });
    const existing = checkRes.user;

    if (existing) {
      console.log(`Found existing user (Role: ${existing.role}). Upgrading to admin...`);
      const updateMutation = gql`
        mutation ($clerkId: String!) {
          updateUser(where: { clerkId: $clerkId }, data: { role: admin }) { id role }
          publishUser(where: { clerkId: $clerkId }) { id }
        }
      `;
      await client.request(updateMutation, { clerkId });
      console.log(`Ì∫Ä Successfully upgraded user to admin!`);
    } else {
      console.log(`No existing user in DB. Creating as admin...`);
      const createMutation = gql`
        mutation ($data: UserCreateInput!) {
          createUser(data: $data) { id role }
          publishUser(where: { clerkId: $data.clerkId }) { id }
        }
      `;
      await client.request(createMutation, { 
        data: { clerkId, email, name: fullname, role: "admin" } 
      });
      console.log(`Ì∫Ä Successfully created new admin!`);
    }

  } catch (error) {
    console.error("‚ùå Seeder failed:");
    console.error(error);
  }
}

run();
