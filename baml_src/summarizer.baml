class SummaryResult {
  urls string[] @description("The urls of the provided sources")
  errors Error[]? @description("A list of errors in the event we cannot access a url")
  title string? @description("A user-friendly title for the summary")
  topic string? @description("Describes the overall topic of the summary")
  summary string? @description("A brief summary of the provided sources (2-3 sentences)")
  tags string[]? @description("A list of tags that relate or describe the summary, tags should all be lowercased and hyphenated")
  sections Section[]? @description("Major topics or sections from the summary")
  practicalApplication PracticalApplication? @description("How this content applies specifically to the user's role and responsibilities")
}

class Error {
  url string @description("The url of the provided source")
  error string @description("An error message we cannot access the url")
}

class PracticalApplication {
  relevanceScore int @description("How relevant this content is to the user's role (1-10 scale)")
  relevanceSummary string @description("Brief explanation of why this is relevant to the user's specific role")
  keyTakeaways string[] @description("3-5 specific insights the user should know")
  actionableItems string[]? @description("Concrete steps or things the user could implement")
  relatedConcepts string[]? @description("Related topics the user might want to explore")
}

class Section {
  title string @description("The title of the section")
  summary string @description("A brief summary of the section")
  codeExamples CodeExample[]? @description("Relevant code examples from this section")
  keyPoints string[]? @description("Main bullet points from this section")
  userRelevance string? @description("How this specific section relates to the user's role")
  refernceUrls string[]? @description("The urls of the provided sources")
}

class CodeExample {
  code string @description("The actual code snippet")
  language string @description("Programming language used")
  description string? @description("What this code example demonstrates")
}


// https://github.com/danielmiessler/fabric/blob/main/patterns/extract_wisdom/system.md
function GenerateSummary(searchResults: SearchResult[], userRole: string, userProfileSynopsis: string) -> SummaryResult {
  client Anthropic
  prompt #"
    # Article Summarizer Tool Prompt

    You are an expert content analyzer that specializes in extracting relevant information based on a user's professional role and responsibilities.

    ## Your Task
    You will receive search results containing article titles and URLs. For each result, you must:
    1. **Fetch the full content** from the provided URL
    2. **Analyze the retrieved content** and create a summary tailored to the user's role and responsibilities
    3. **Focus on extracting information** that is most relevant and actionable for their particular position

    ## Input Format
    Each search result will include the following fields:
    - **url**: The web address you need to fetch content from
    - **title**: The article headline (for reference only)
    - **relevanceScore**: Initial relevance assessment (optional)

    **Important**: The search results contain only titles and URLs. You must retrieve the actual article content by accessing each URL before you can provide a meaningful summary.

    ## Error Handling

    - **Inaccessible URLs**: Provide clear error messages and attempt to extract useful information from the title if available
    - **Partial Content**: If only partial content is accessible, clearly indicate what was analyzed
    - **Technical Issues**: Explain any limitations that prevented full content analysis
    - If you cannot access the url, you should not include it in the summary
    - If more than 2 urls are inaccessible, you should return an error message and end the process

    ## User Context

    Role: {{ userRole }}
    Responsibilities: {{ userProfileSynopsis }}

    ## Processing Instructions

    1. **Content Retrieval**: 
      - Access each provided URL to retrieve the full article content
      - Handle any access issues (paywalls, broken links, etc.) gracefully

    2. **Content Analysis**: 
      - Read and analyze the entire retrieved content
      - Extract key information relevant to the user's role

    3. **Relevance Filtering**: 
      - Filter and prioritize information based on how it relates to the user's specific role and responsibilities
      - Focus on practical applications and actionable insights

    4. **Professional Context**: 
      - Frame everything in terms of how it applies to their day-to-day work
      - Emphasize what the user can actually implement or act upon

    ## Output Requirements

    - **URL Access Status**: Clearly indicate if content was successfully retrieved or if there were access issues
    - **Relevance Scoring**: Rate content relevance on a 1-10 scale for the user's role
    - **Actionable Insights**: Focus on what the user can actually do with this information
    - **Code Examples**: Extract and explain any code that's relevant to their work (with proper context)
    - **Professional Framing**: Present everything through the lens of their specific responsibilities

    ## Error Handling

    - **Inaccessible URLs**: Provide clear error messages and attempt to extract useful information from the title if available
    - **Partial Content**: If only partial content is accessible, clearly indicate what was analyzed
    - **Technical Issues**: Explain any limitations that prevented full content analysis

    ## Quality Guidelines

    - Keep summaries concise but comprehensive
    - Use professional, clear language
    - Prioritize practical value over theoretical concepts
    - Include specific examples when possible
    - Make tags descriptive and searchable (lowercase, hyphenated)
    - Ensure code examples include proper context and explanations

    ## Example Workflow
    1. Receive search result with title "Advanced RuboCop Configuration" and URL
    2. Fetch full article content from the provided URL
    3. If user is a "Software Engineer working on internal tools":
      - Focus on integration into development workflow
      - Extract configuration examples for internal projects
      - Highlight team adoption strategies
      - Provide actionable setup instructions

    Remember: You cannot provide meaningful summaries based solely on titles and URLs. Always retrieve the full content first, then analyze it through the lens of the user's specific professional context.

    ## Input Data
    Here are the search results to process:
    {{ searchResults }}

    ## Required Output Format
    {{ ctx.output_format }}
  "#
}

test my_summary {
  functions [GenerateSummary]
  args {
    url "https://www.honeybadger.io/blog/ruby-dry-schema/"
    userRole "Technical Architect and Senior Software Engineer"
    userProfileSynopsis #"
      I am a technical architect at a consulting firm.  My day-day to duties involve API design, creating internal tools in ruby, system design, devops, and general programming as necessary.
      I am skilled in most areas but ruby is a particularly new area for me. I have experience with python, java, javascript, typescript, and golang. 
      I know AWS fairly well but Azure is pretty lacking. In terms of devops I am familiar with Gitlab CI and Jenkins but not much else.
      Much of my day to day involves API design via open api specifications. But a fair bit of it also involves creating internal tooling using core ruby (meaning not ruby on rails)
    "#,
    searchResults [
      InputSearchResult {
        url: "https://jaceksamol.com/2023/09/10/the-ultimate-showdown-rvm-vs-asdf-which-is-the-superior-choice/",
        title: "Introduction to Ruby Version Managers (RVM) and ASDF",
      },
      InputSearchResult {
        url: "https://dev.to/yet_anotherdev/state-of-ruby-what-version-manager-to-use-4gbg",
        title: "State of Ruby : What version manager to use - DEV Community",
      },
      InputSearchResult {
        url: "https://profficity.com/articles/ruby-version-managers-pros-and-cons",
        title: "Profficity | Ruby Version Managers: Pros and Cons",
      }
    ]
  }
}