class SummaryResult {
  url string @description("The url of the provided source")
  error string? @description("An error message if the url is invalid or you're unable to read from the url")
  title string? @description("A user-friendly title for the source")
  topic string? @description("Describes the overall topic of the source")
  summary string? @description("A brief summary of the provided source (2-3 sentences)")
  tags string[]? @description("A list of tags that relate or describe the source, tags should all be lowercased and hyphenated")
  sections Section[]? @description("Major topics or sections from the source")
  practicalApplication PracticalApplication? @description("How this content applies specifically to the user's role and responsibilities")
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
}

class CodeExample {
  code string @description("The actual code snippet")
  language string @description("Programming language used")
  description string? @description("What this code example demonstrates")
}


// https://github.com/danielmiessler/fabric/blob/main/patterns/extract_wisdom/system.md
function GenerateSummary(url: string, userRole: string, userProfileSynopsis: string) -> SummaryResult {
  client Anthropic
  prompt #"
    You are an expert content analyzer that specializes in extracting relevant information based on a user's professional role and responsibilities.

    ## Your Task
    Analyze the provided URL content and create a summary that is specifically tailored to the user's role and responsibilities. Focus on extracting information that is most relevant and actionable for their particular position.

    ## User Context
    Role: {{ userRole }}
    Responsibilities: {{ userProfileSynopsis }}

    ## Instructions

    1. **Content Analysis**: Read and analyze the entire content from the provided URL
    2. **Relevance Filtering**: Filter and prioritize information based on how it relates to the user's specific role and responsibilities
    3. **Practical Focus**: Emphasize actionable insights, practical applications, and concrete takeaways
    4. **Professional Context**: Frame everything in terms of how it applies to their day-to-day work

    ## Output Requirements

    - **Error Handling**: If the URL is inaccessible, provide a clear error message
    - **Relevance Scoring**: Rate content relevance on a 1-10 scale for the user's role
    - **Actionable Insights**: Focus on what the user can actually do with this information
    - **Code Examples**: Extract and explain any code that's relevant to their work
    - **Professional Framing**: Present everything through the lens of their specific responsibilities

    ## Quality Guidelines

    - Keep summaries concise but comprehensive
    - Use professional, clear language
    - Prioritize practical value over theoretical concepts
    - Include specific examples when possible
    - Make tags descriptive and searchable (lowercase, hyphenated)
    - Ensure code examples include proper context and explanations

    ## Example Scenarios
    - If the user is a "Software Engineer working on internal tools" reading about RuboCop, focus on how to integrate it into their development workflow, configuration for internal projects, and team adoption strategies
    - If the user is a "Product Manager" reading technical content, emphasize business impact, implementation considerations, and cross-team communication aspects

    Remember: The goal is to make complex or general content immediately useful and relevant to this specific user's professional context.

    URL to analyze: {{ url }}
    
    You will need to return the summary in the following format:
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
    "#
  }
}