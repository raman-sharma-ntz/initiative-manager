import { hygraph as client } from '../../lib/hygraph';
import { gql } from 'graphql-request';

type CreateProgramInput = {
  name: string;
  description?: string;
};

// client is now imported from src/lib/hygraph.ts
export const createProgram = async (data: CreateProgramInput): Promise<unknown> => {
  const mutation = gql`
    mutation CreateProgram($data: ProgramCreateInput!) {
      createProgram(data: $data) { id name }
    }
  `;
  return await client.request(mutation, { data });
};