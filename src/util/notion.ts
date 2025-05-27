import { BlockObjectRequest, Client } from "@notionhq/client";
import { z } from "zod";
import { Section, SummaryResult } from "../baml_client/types";

const PAGE_ID = z.string().parse(process.env.NOTION_PAGE_ID);
const SOURCES_PAGE_TITLE = "Sources";

const notion = new Client({
  auth: z.string().parse(process.env.NOTION_TOKEN),
});

const DATABASE_NAME = "KB Entries Database";

// Helper function to create rich text
function createRichText(content: string, annotations?: any) {
  return [
    {
      type: "text" as const,
      text: {
        content: content,
      },
      annotations: annotations || {},
    },
  ];
}

// Helper function to create blocks from sections
function createSectionBlocks(sections: Section[]): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  sections.forEach((section) => {
    // Add section title as heading
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: createRichText(section.title),
      },
    });

    // Add section summary
    if (section.summary) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: createRichText(section.summary),
        },
      });
    }

    // Add examples if they exist
    if (section.codeExamples) {
      section.codeExamples.forEach((item) => {
        blocks.push({
          object: "block",
          type: "code",
          code: {
            rich_text: createRichText(item.codeExample),
            // @ts-ignore
            language: item.language,
          },
        });
      });
    }

    // Add bullet points if they exist
    if (section.mainBulletPoints && section.mainBulletPoints.length > 0) {
      section.mainBulletPoints.forEach((bulletPoint) => {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: createRichText(bulletPoint),
          },
        });
      });
    }

    // Add some spacing between sections
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: createRichText(""),
      },
    });
  });

  return blocks;
}

// Helper function to get or create the Sources page
async function getOrCreateSourcesPage() {
  try {
    // First try to find an existing Sources page
    const response = await notion.search({
      query: SOURCES_PAGE_TITLE,
      filter: {
        property: "object",
        value: "page",
      },
    });

    if (response.results.length > 0) {
      return response.results[0].id;
    }

    // If no Sources page exists, create one
    const page = await notion.pages.create({
      parent: {
        page_id: PAGE_ID,
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: SOURCES_PAGE_TITLE,
              },
            },
          ],
        },
      },
    });

    return page.id;
  } catch (error) {
    console.error("Error getting/creating Sources page:", error);
    throw error;
  }
}

async function getOrCreateDatabase() {
  try {
    // First try to find an existing database
    const response = await notion.search({
      query: DATABASE_NAME,
      filter: {
        property: "object",
        value: "database",
      },
    });

    // If database exists, verify we can access it
    if (response.results.length > 0) {
      try {
        const databaseId = response.results[0].id;
        // Verify we can access the database
        await notion.databases.retrieve({ database_id: databaseId });
        return databaseId;
      } catch (error) {
        console.log("Found database but cannot access it, creating new one");
      }
    }

    // If no database exists or we can't access it, create one
    const database = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: PAGE_ID,
      },
      title: [
        {
          type: "text",
          text: {
            content: DATABASE_NAME,
          },
        },
      ],
      icon: {
        type: "emoji",
        emoji: "📚",
      },
      cover: {
        type: "external",
        external: {
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        },
      },
      properties: {
        Name: {
          title: {},
        },
        URL: {
          url: {},
        },
        Topic: {
          rich_text: {},
        },
        Tags: {
          multi_select: {},
        },
        Summary: {
          rich_text: {},
        },
        PracticalApplication: {
          rich_text: {},
        },
        DetailedPage: {
          url: {},
        },
      },
    });

    // Verify the database was created successfully
    if (!database || !database.id) {
      throw new Error("Failed to create database");
    }

    return database.id;
  } catch (error) {
    console.error("Error getting/creating Notion database:", error);
    throw error;
  }
}

export async function createNotionSubPageFromSummary(
  parentPageId: string,
  summaryResult: SummaryResult
) {
  if (summaryResult.error) {
    throw new Error("cannot process a summary result with errors");
  }

  try {
    // Create content blocks
    const contentBlocks: BlockObjectRequest[] = [];

    // Add practical application if it exists
    if (summaryResult.practicalApplication) {
      contentBlocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: createRichText("Practical Application"),
        },
      });

      contentBlocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: createRichText(summaryResult.practicalApplication),
        },
      });

      // Add some spacing
      contentBlocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: createRichText(""),
        },
      });
    }

    // Add tags if they exist
    if (summaryResult.tags && summaryResult.tags.length > 0) {
      contentBlocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Tags: ",
              },
              annotations: {
                bold: true,
              },
            },
            {
              type: "text",
              text: {
                content: summaryResult.tags.join(", "),
              },
            },
          ],
        },
      });

      // Add some spacing
      contentBlocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: createRichText(""),
        },
      });
    }

    // Add main summary if it exists
    if (summaryResult.summary) {
      contentBlocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: createRichText("Summary"),
        },
      });

      contentBlocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: createRichText(summaryResult.summary),
        },
      });
    }

    // Add sections if they exist
    if (summaryResult.sections && summaryResult.sections.length > 0) {
      contentBlocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: createRichText("Detailed Sections"),
        },
      });

      contentBlocks.push(...createSectionBlocks(summaryResult.sections));
    }

    // Add source URL at the bottom
    contentBlocks.push({
      object: "block",
      type: "divider",
      divider: {},
    });

    contentBlocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "Source: ",
            },
          },
          {
            type: "text",
            text: {
              content: summaryResult.url,
              link: {
                url: summaryResult.url,
              },
            },
          },
        ],
      },
    });

    const response = await notion.pages.create({
      parent: {
        page_id: parentPageId,
      },
      properties: {
        title: {
          title: createRichText(
            summaryResult.title ||
              summaryResult.topic ||
              `Summary from ${summaryResult.url}`
          ),
        },
      },
      children: contentBlocks,
    });

    return response;
  } catch (error) {
    console.error("Error creating Notion sub-page from summary:", error);
    throw error;
  }
}

export async function processSummaryResult(summaryResult: SummaryResult) {
  if (summaryResult.error) {
    throw new Error("cannot process a summary result with errors");
  }

  try {
    // Get or create the database
    const databaseId = await getOrCreateDatabase();

    // Get or create the Sources page
    const sourcesPageId = await getOrCreateSourcesPage();

    // Create the detailed page under the Sources page
    const pageResponse = await createNotionSubPageFromSummary(
      sourcesPageId,
      summaryResult
    );

    // Create a database entry
    const databaseEntry = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content:
                  summaryResult.title ||
                  summaryResult.topic ||
                  `Summary from ${summaryResult.url}`,
              },
            },
          ],
        },
        URL: {
          url: summaryResult.url,
        },
        Topic: {
          rich_text: [
            {
              text: {
                content: summaryResult.topic || "",
              },
            },
          ],
        },
        Tags: {
          multi_select: (summaryResult.tags || []).map((tag) => ({
            name: tag,
          })),
        },
        Summary: {
          rich_text: [
            {
              text: {
                content: summaryResult.summary || "",
              },
            },
          ],
        },
        PracticalApplication: {
          rich_text: [
            {
              text: {
                content: summaryResult.practicalApplication || "",
              },
            },
          ],
        },
        DetailedPage: {
          url: `notion://www.notion.so/${pageResponse.id.replace(/-/g, "")}`,
        },
      },
    });

    return {
      page: pageResponse,
      databaseEntry,
    };
  } catch (error) {
    console.error("Error processing summary result:", error);
    throw error;
  }
}
