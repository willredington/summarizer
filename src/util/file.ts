import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { SummaryResult } from "../baml_client/types";

export function writeSummaryToFile(
  summaryResult: SummaryResult,
  outputPath: string
): void {
  try {
    // Ensure the output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Create the markdown content
    const markdownContent = `# ${summaryResult.title}\n\n${
      summaryResult.markdownContent
    }\n\n## Tags\n${summaryResult.tags.map((tag) => `- ${tag}`).join("\n")}`;

    // Write the file
    writeFileSync(outputPath, markdownContent, "utf-8");
  } catch (error) {
    console.error("Error writing summary to file:", error);
    throw error;
  }
}
