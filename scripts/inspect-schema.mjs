import 'dotenv/config';
import fs from 'node:fs';
import { GraphQLClient, gql } from 'graphql-request';

const token = process.env.HYGRAPH_TOKEN;
const endpoint = process.env.HYGRAPH_ENDPOINT;

if (!token || !endpoint) {
  console.error("Missing config");
  process.exit(1);
}

const client = new GraphQLClient(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
});

async function run() {
  const query = gql`
    query {
      __schema {
        types {
          name
          kind
          fields {
            name
          }
        }
      }
    }
  `;
  try {
    const r = await client.request(query);
    const names = r.__schema.types
      .filter(t => t.kind === 'OBJECT' || t.kind === 'ENUM')
      .map(t => ({ name: t.name, fields: t.fields?.map(f => f.name) }));
    
    fs.writeFileSync('current_schema.json', JSON.stringify(names, null, 2));
    console.log("✅ Schema saved to current_schema.json");
  } catch (e) {
    console.error(e);
  }
}

run();
