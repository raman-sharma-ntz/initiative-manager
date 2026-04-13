import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';

const token = process.env.HYGRAPH_TOKEN;
const endpoint = 'https://management-ap-south-1.hygraph.com/graphql';

const client = new GraphQLClient(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
});

async function discover() {
  const query = gql`
    query {
      viewer {
        ... on TokenViewer {
          project {
            environments {
              name
              models { apiId }
              enumerations { apiId }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await client.request(query);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

discover();
