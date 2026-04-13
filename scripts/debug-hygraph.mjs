import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';

const token = process.env.HYGRAPH_TOKEN;
const endpoint = process.env.HYGRAPH_ENDPOINT;

if (!token || !endpoint) {
  console.error("Missing HYGRAPH_TOKEN or HYGRAPH_ENDPOINT in your .env file.");
  process.exit(1);
}

const mgmtEndpoint = 'https://management-ap-south-1.hygraph.com/graphql';

const client = new GraphQLClient(mgmtEndpoint, {
  headers: { Authorization: `Bearer ${token}` },
});

async function debug() {
  console.log(`🔍 Checking Hygraph Management API at: ${endpoint}`);
  
  const query = gql`
    query {
      viewer {
        ... on TokenViewer {
          project {
            id
            name
            environments {
              id
              name
              endpoint
              migrations(first: 5) {
                id
                name
                status
                errors
                createdAt
                finishedAt
              }
            }
            models {
              apiId
            }
            enumerations {
              apiId
            }
          }
        }
      }
    }
  `;

  try {
    const res = await client.request(query);
    console.log("✅ Connection Successful!");
    
    if (res.viewer && res.viewer.project) {
      const project = res.viewer.project;
      console.log(`Project: ${project.name} (${project.id})`);
      console.log("Environments:");
      project.environments.forEach((env) => {
        console.log(` - ${env.name} (${env.id}) -> ${env.endpoint}`);
      });
    } else {
      console.log("❌ No project found for this token. Verify permissions and endpoint region.");
    }
  } catch (err) {
    console.error("❌ Debug query failed:");
    if (err.response && err.response.errors) {
      console.error(JSON.stringify(err.response.errors, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

debug();
