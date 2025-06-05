#!/usr/bin/env node

import "dotenv/config";

import { b } from "./baml_client";
import { search } from "./service/search";
import { createSummaryInNotion } from "./util/notion";

type UserProfile = {
  name: string;
  role: string;
  description: string;
};

const workUserProfile: UserProfile = {
  name: "work",
  role: "Technical Architect and Senior Software Engineer",
  description: `I am a technical architect at a consulting firm.  My day-day to duties involve API design, creating internal tools in ruby, system design, devops, and general programming as necessary.
      I am skilled in most areas but ruby is a particularly new area for me. I have experience with python, java, javascript, typescript, and golang. 
      I know AWS fairly well but Azure is pretty lacking. In terms of devops I am familiar with Gitlab CI and Jenkins but not much else.
      Much of my day to day involves API design via open api specifications. But a fair bit of it also involves creating internal tooling using core ruby (meaning not ruby on rails)`,
};

const userProfiles: UserProfile[] = [workUserProfile];

async function main() {
  console.log("Starting summarization process...");
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error("Usage: <user-profile-name> <topic>");
    process.exit(1);
  }

  const [userProfileName, topic] = args;
  console.log(`Processing request for profile: ${userProfileName}`);
  console.log(`Topic: ${topic}`);

  const userProfile = userProfiles.find(
    (profile) => profile.name === userProfileName
  );

  if (!userProfile) {
    console.error(`Could not find user profile: ${userProfileName}`);
    process.exit(1);
  }

  console.log("User profile found successfully");

  const tavilySearchResults = await search(topic);
  console.log(`Found ${tavilySearchResults.length} search results`);

  const searchResults = tavilySearchResults.map((result) => ({
    url: result.url,
    title: result.title,
    content: result.content,
  }));

  const relevantResults = await b.GetRelevantResults(
    searchResults,
    userProfile.description
  );

  console.log("Relevant results:", relevantResults.searchResults);

  console.log("Generating new summary...");
  const summary = await b.GenerateSummary(
    relevantResults.searchResults,
    userProfile.role,
    userProfile.description
  );

  console.log("Summary generated successfully");

  await createSummaryInNotion(summary);

  console.log("Summary processed successfully");
  console.log("Process completed successfully");
}

main().catch((err) => {
  console.error("An error occurred during execution:");
  console.error(err);
  process.exit(1);
});
