"use server";
import { hygraph as client } from "../../lib/hygraph";
import { gql } from "graphql-request";
import { Program } from "../../types/models";
import { sanitizeText } from "../../lib/validation/sanitize";

export const fetchPrograms = async (): Promise<Program[]> => {
  const query = gql`{ programs { id name description } }`;
  const res = await client.request(query);
  return res.programs;
};

export const createProgram = async (data: { name: string; description: string }) => {
  const safeData = {
    name: sanitizeText(data.name, 100),
    description: sanitizeText(data.description, 1000),
  };

  if (!safeData.name) {
    throw new Error("Program name is required.");
  }

  const mutation = gql`
    mutation ($data: ProgramCreateInput!) {
      createProgram(data: $data) { id name }
      publishProgram(where: {name: $data.name}) { id }
    }
  `;
  return client.request(mutation, { data: safeData });
};