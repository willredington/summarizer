#!/usr/bin/env node

import "dotenv/config";

import { b } from "./baml_client";
import { cacheSummary, getCachedSummary } from "./util/cache";
import { processSummaryResult } from "./util/notion";

type UserProfile = {
  name: string;
  description: string;
};

const workUserProfile: UserProfile = {
  name: "work",
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
    console.error("Usage: <user-profile-name> <URL>");
    process.exit(1);
  }

  const [userProfileName, url] = args;
  console.log(`Processing request for profile: ${userProfileName}`);
  console.log(`Target URL: ${url}`);

  const userProfile = userProfiles.find(
    (profile) => profile.name === userProfileName
  );

  if (!userProfile) {
    console.error(`Could not find user profile: ${userProfileName}`);
    process.exit(1);
  }
  console.log("User profile found successfully");

  // Check cache first
  const cachedSummary = getCachedSummary(url, userProfile.description);
  if (cachedSummary) {
    console.log("Found cached summary");
    await processSummaryResult(cachedSummary);
    console.log("Summary processed successfully");
    console.log(`Wrote ${cachedSummary.url} to Notion`);
    console.log("Process completed successfully");
    return;
  }

  console.log("Generating summary...");
  const summary = await b.GenerateSummary(url, userProfile.description);
  console.log("Summary generated successfully");

  // Cache the new summary
  cacheSummary(url, userProfile.description, summary);

  console.log("Processing summary result...");
  await processSummaryResult(summary);

  console.log("Summary processed successfully");
  console.log(`Wrote ${summary.url} to Notion`);
  console.log("Process completed successfully");
}

main().catch((err) => {
  console.error("An error occurred during execution:");
  console.error(err);
  process.exit(1);
});
