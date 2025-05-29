import { SummaryResult } from "../baml_client";

import { BlockObjectRequest, Client } from "@notionhq/client";
import z from "zod";
import {
  CodeExample,
  PracticalApplication,
  Section,
} from "../baml_client/types";

const NOTION_PAGE_ID = z.string().parse(process.env.NOTION_PAGE_ID);
const NOTION_TOKEN = z.string().parse(process.env.NOTION_TOKEN);

export class NotionSummaryCreator {
  private notion: Client;
  private parentPageId: string;

  constructor(config: { notion: Client; parentPageId: string }) {
    this.notion = config.notion;
    this.parentPageId = config.parentPageId;
  }

  async createSummaryContent(summaryResult: SummaryResult) {
    // Handle error case
    if (summaryResult.error) {
      throw new Error(
        `Cannot create content due to error: ${summaryResult.error}`
      );
    }

    const subPageId = await this.createSubPage(summaryResult);

    // Remove any dashes from the ID as Notion uses a different format
    const cleanPageId = subPageId.replace(/-/g, "");
    const linkToSubPage = `https://www.notion.so/${cleanPageId}`;

    console.log("Page ID:", subPageId);
    console.log("Clean Page ID:", cleanPageId);
    console.log("Final URL:", linkToSubPage);

    const databaseId = await this.getOrCreateDatabase();

    await this.createDatabaseEntry(summaryResult, databaseId, linkToSubPage);
  }

  private async getOrCreateDatabase(): Promise<string> {
    try {
      // Search for databases on the parent page
      const response = await this.notion.blocks.children.list({
        block_id: this.parentPageId,
      });

      // Find the first database block
      const databaseBlock = response.results.find(
        (block) => "type" in block && block.type === "child_database"
      );

      if (databaseBlock && "id" in databaseBlock) {
        return databaseBlock.id;
      }

      // If no database found, create a new one
      const newDatabase = await this.notion.databases.create({
        parent: {
          type: "page_id",
          page_id: this.parentPageId,
        },
        title: [
          {
            text: {
              content: "Knowledge Base Database",
            },
          },
        ],
        icon: {
          emoji: "📚",
        },
        properties: {
          Title: {
            type: "title",
            title: {},
          },
          "Source URL": {
            type: "url",
            url: {},
          },
          Tags: {
            type: "multi_select",
            multi_select: {
              options: [],
            },
          },
          "Created Date": {
            type: "created_time",
            created_time: {},
          },
          Page: {
            type: "url",
            url: {},
          },
        },
      });

      return newDatabase.id;
    } catch (error) {
      throw error;
    }
  }

  private async createSubPage(summaryResult: SummaryResult): Promise<string> {
    const pageTitle = summaryResult.title || "Untitled Summary";
    const children = this.buildPageBlocks(summaryResult);

    const response = await this.notion.pages.create({
      parent: {
        page_id: this.parentPageId,
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: pageTitle,
              },
            },
          ],
        },
      },
      children,
    });

    return response.id;
  }

  private async createDatabaseEntry(
    summaryResult: SummaryResult,
    databaseId: string,
    linkToPage: string
  ) {
    await this.notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Title: {
          type: "title",
          title: [
            {
              text: { content: summaryResult.title || "Untitled Summary" },
            },
          ],
        },
        "Source URL": {
          type: "url",
          url: summaryResult.url,
        },
        Tags: {
          type: "multi_select",
          multi_select:
            summaryResult.tags?.map((tag) => ({
              name: tag,
            })) || [],
        },
        Page: {
          type: "url",
          url: linkToPage,
        },
      },
    });
  }

  private buildPageBlocks(summaryResult: SummaryResult) {
    const blocks: BlockObjectRequest[] = [];

    blocks.push({
      object: "block",
      type: "callout",
      callout: {
        icon: {
          emoji: "💡",
        },
        rich_text: [
          {
            text: {
              content: "Source URL",
            },
          },
        ],
        children: [
          {
            object: "block",
            type: "embed",
            embed: {
              url: summaryResult.url,
              caption: [
                {
                  text: {
                    content: "Source URL",
                  },
                },
              ],
            },
          },
        ],
      },
    });

    // Add summary section
    if (summaryResult.summary) {
      blocks.push(
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ text: { content: "📝 Summary" } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: summaryResult.summary } }],
          },
        }
      );
    }

    // Add practical application section
    if (summaryResult.practicalApplication) {
      blocks.push(
        ...this.buildPracticalApplicationBlocks(
          summaryResult.practicalApplication
        )
      );
    }

    // Add sections
    if (summaryResult.sections && summaryResult.sections.length > 0) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ text: { content: "📚 Detailed Sections" } }],
        },
      });

      summaryResult.sections.forEach((section) => {
        blocks.push(...this.buildSectionBlocks(section));
      });
    }

    // Add divider before source
    blocks.push({
      object: "block",
      type: "divider",
      divider: {},
    });

    return blocks;
  }

  private buildPracticalApplicationBlocks(practicalApp: PracticalApplication) {
    const blocks: BlockObjectRequest[] = [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ text: { content: "🎯 Practical Application" } }],
        },
      },
    ];

    // Relevance summary
    blocks.push({
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "💡" },
        rich_text: [
          {
            text: {
              content: `Relevance Score: ${practicalApp.relevanceScore}/10`,
            },
          },
        ],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: practicalApp.relevanceSummary,
                  },
                },
              ],
            },
          },
        ],
      },
    });

    // Key takeaways
    if (practicalApp.keyTakeaways && practicalApp.keyTakeaways.length > 0) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ text: { content: "🔑 Key Takeaways" } }],
          children: practicalApp.keyTakeaways.map((takeaway) => ({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [{ text: { content: takeaway } }],
            },
          })),
        },
      });
    }

    // Actionable items
    if (
      practicalApp.actionableItems &&
      practicalApp.actionableItems.length > 0
    ) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ text: { content: "✅ Action Items" } }],
          children: practicalApp.actionableItems.map((item) => ({
            object: "block",
            type: "to_do",
            to_do: {
              rich_text: [{ text: { content: item } }],
              checked: false,
            },
          })),
        },
      });
    }

    // Related concepts
    if (
      practicalApp.relatedConcepts &&
      practicalApp.relatedConcepts.length > 0
    ) {
      blocks.push(
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ text: { content: "🔗 Related Concepts" } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                text: {
                  content: practicalApp.relatedConcepts.join(" • "),
                },
              },
            ],
          },
        }
      );
    }

    return blocks;
  }

  private buildSectionBlocks(section: Section) {
    const blocks: any[] = [
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ text: { content: section.title } }],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content: section.summary } }],
        },
      },
    ];

    // User relevance
    if (section.userRelevance) {
      blocks.push({
        object: "block",
        type: "callout",
        callout: {
          icon: { emoji: "👤" },
          rich_text: [
            {
              text: {
                content: `For your role: ${section.userRelevance}`,
              },
            },
          ],
        },
      });
    }

    // Key points
    if (section.keyPoints && section.keyPoints.length > 0) {
      blocks.push(
        ...section.keyPoints.map((point) => ({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ text: { content: point } }],
          },
        }))
      );
    }

    // Code examples
    if (section.codeExamples && section.codeExamples.length > 0) {
      section.codeExamples.forEach((codeExample) => {
        blocks.push(...this.buildCodeExampleBlocks(codeExample));
      });
    }

    return blocks;
  }

  private buildCodeExampleBlocks(codeExample: CodeExample) {
    const blocks: any[] = [];

    // Add description if available
    if (codeExample.description) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: `💻 ${codeExample.description}`,
              },
            },
          ],
        },
      });
    }

    // Add the code block
    blocks.push({
      object: "block",
      type: "code",
      code: {
        language: this.mapLanguageToNotionLanguage(codeExample.language),
        rich_text: [
          {
            text: {
              content: codeExample.code,
            },
          },
        ],
      },
    });

    return blocks;
  }

  private mapLanguageToNotionLanguage(language: string): string {
    // Map common language names to Notion's supported languages
    const languageMap: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      java: "java",
      cpp: "c++",
      "c++": "c++",
      c: "c",
      csharp: "c#",
      "c#": "c#",
      ruby: "ruby",
      php: "php",
      go: "go",
      rust: "rust",
      swift: "swift",
      kotlin: "kotlin",
      scala: "scala",
      html: "markup",
      css: "css",
      sql: "sql",
      bash: "bash",
      shell: "bash",
      json: "json",
      yaml: "yaml",
      xml: "markup",
    };

    return languageMap[language.toLowerCase()] || "plain text";
  }
}

export async function createSummaryInNotion(summaryResult: SummaryResult) {
  const notion = new Client({
    auth: NOTION_TOKEN,
  });

  const creator = new NotionSummaryCreator({
    notion,
    parentPageId: NOTION_PAGE_ID,
  });

  return await creator.createSummaryContent(summaryResult);
}
