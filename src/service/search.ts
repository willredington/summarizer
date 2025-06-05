import { tavily } from "@tavily/core";
import z from "zod";

const tvly = tavily({ apiKey: z.string().parse(process.env.TAVILY_API_KEY) });

export async function search(query: string) {
  const response = await tvly.search(query, {
    maxResults: 10,
  });

  return response.results;
}
