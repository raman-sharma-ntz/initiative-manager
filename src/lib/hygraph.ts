import { GraphQLClient } from "graphql-request";

const endpoint = process.env.HYGRAPH_ENDPOINT;
const token = process.env.HYGRAPH_TOKEN;

if (!endpoint || !token) {
  throw new Error("Missing HYGRAPH_ENDPOINT or HYGRAPH_TOKEN environment variables.");
}

/**
 * Shared Hygraph client for server-side GraphQL requests.
 * Uses the Permanent Auth Token for administrative and read/write operations.
 */
export const hygraph = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
  // Disable caching for server actions to ensure fresh data
  cache: "no-store",
});
