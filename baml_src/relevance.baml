class RelevanceResult {
  searchResults SearchResult[]
}

class InputSearchResult {
  url string 
  title string
  content string
}

class SearchResult {
  url string
  title string
  relevanceScore int? @description("How relevant this content is to the user's role (1-10 scale)")
}


function GetRelevantResults(searchResults: InputSearchResult[], userProfileSynopsis: string) -> RelevanceResult {
  client Anthropic
  prompt #"
    # Search Result Relevance Selection Prompt

    You are tasked with selecting the most relevant search results for a specific user based on their profile, expertise level, and current needs.

    ## Input Format
    You will receive:
    1. **User Profile**: Contains name, role, description, skills, experience level, and current focus areas
    2. **Search Results**: Array of search result objects with title, url, content, and relevance score

    ## Selection Criteria

    ### Primary Relevance Factors (Weight: 40%)
    - **Direct Task Relevance**: Does the content directly address the user's current work or immediate needs?
    - **Skill Level Appropriateness**: Is the content suitable for the user's expertise level in the specific domain?
    - **Role Alignment**: Does the content match the user's professional responsibilities and daily duties?

    ### Secondary Relevance Factors (Weight: 30%)
    - **Learning Gaps**: Does the content help fill knowledge gaps mentioned in the user's profile?
    - **Tool/Technology Match**: Does the content cover tools, languages, or technologies the user works with?
    - **Practical Application**: Can the user immediately apply this information to their work?

    ### Contextual Factors (Weight: 20%)
    - **Experience Transfer**: Can the user leverage their existing skills (from other languages/tools) with this content?
    - **Depth Appropriateness**: Is the content at the right technical depth (not too basic, not too advanced)?
    - **Workflow Integration**: Does the content fit into the user's existing development workflow?

    ### Quality Indicators (Weight: 10%)
    - **Content Freshness**: Is the information current and up-to-date?
    - **Source Authority**: Is the source reputable and trustworthy?
    - **Completeness**: Does the content provide actionable, complete information?

    ## Selection Process

    1. **Profile Analysis**: 
      - Identify user's expertise level in the search topic area
      - Note specific technologies, tools, and methodologies they use
      - Understand their role requirements and daily responsibilities
      - Identify stated knowledge gaps or learning areas

    2. **Content Evaluation**:
      - Score each result against the relevance factors above
      - Consider how the content serves their immediate vs. long-term needs
      - Evaluate if the content complexity matches their skill level
      - Assess practical applicability to their current projects

    3. **Ranking Strategy**:
      - Prioritize content that directly supports their current work
      - Favor content that builds on their existing expertise
      - Include diverse perspectives when multiple high-quality options exist
      - Balance immediate utility with strategic learning value

    ## Output Requirements

    Return the top 3-5 most relevant results with:
    - **Selected Results**: The chosen search results in order of relevance
    - **Relevance Reasoning**: 2-3 sentence explanation for each selection explaining why it's valuable for this specific user
    - **Confidence Score**: 1-10 rating of how well the selection matches the user's needs

    ## Example Application

    For a user profile like:
    ```
    Role: Technical Architect and Senior Software Engineer  
    Skills: Python, Java, JavaScript, TypeScript, Golang
    Learning Area: Ruby (new to the language)
    Daily Work: API design, internal tools, system design
    Experience Level: Senior in general programming, beginner in Ruby
    ```

    Selection would prioritize:
    - Ruby content appropriate for experienced programmers new to Ruby
    - Practical Ruby development guidance over theoretical concepts
    - Content that leverages their existing programming knowledge
    - Tools and approaches relevant to API development and internal tooling

    ## Key Considerations

    - **Avoid Beginner Bias**: Don't select overly basic content for experienced developers learning a new technology
    - **Context Over Keywords**: Prioritize contextual relevance over simple keyword matching
    - **Practical Over Academic**: Favor actionable content over purely theoretical discussions
    - **Current Over Comprehensive**: Select immediately useful information over exhaustive references

    Remember: The goal is to provide the most immediately valuable and actionable information for this specific user's current situation and learning journey.

    Here are the search results:
    {{ searchResults }}

    Here is the user profile:
    {{ userProfileSynopsis }}

    You will need to return the summary in the following format:
    {{ ctx.output_format }}
  "#
}

test get_relevant_results {
  functions [GetRelevantResults]
  args {
    searchResults [
      InputSearchResult {
        url: "https://jaceksamol.com/2023/09/10/the-ultimate-showdown-rvm-vs-asdf-which-is-the-superior-choice/",
        title: "Introduction to Ruby Version Managers (RVM) and ASDF",
        content: "Choosing the best Ruby version manager depends on your specific needs and preferences. If you value a rich feature set, extensive community support, and the ability to manage gemsets, RVM may be the right choice for you. On the other hand, if you prefer a lightweight and efficient tool with a simplified workflow, ASDF is worth considering."
      },
      InputSearchResult {
        url: "https://dev.to/yet_anotherdev/state-of-ruby-what-version-manager-to-use-4gbg",
        title: "State of Ruby : What version manager to use - DEV Community",
        content: "Let's understand the critical difference between those and help you make some choices for your Ruby Version manager. Community Leaderboard : 1.Rbenv 2.ASDF 3.Chruby First, the Tweet shows that Rbenv is a great winner for the Ruby community. But it seems mainly because it is the goto solution."
      },
      InputSearchResult {
        url: "https://profficity.com/articles/ruby-version-managers-pros-and-cons",
        title: "Profficity | Ruby Version Managers: Pros and Cons",
        content: "Choosing the right Ruby version manager depends on your specific needs and preferences. RVM is great for those who need a feature-rich tool with extensive community support. rbenv offers simplicity and extensibility, while chruby provides a minimalistic approach with no performance overhead. asdf is ideal for developers working with multiple languages."
      },
      InputSearchResult {
        url: "https://github.com/rbenv/rbenv/wiki/Comparison-of-version-managers",
        title: "Comparison of version managers · rbenv/rbenv Wiki - GitHub",
        content: "chruby is a minimal Ruby version manager that hooks into your shell.. It has no overhead on ruby execution time because it does the switching either on-demand or, optionally, whenever you cd into a project directory. Additionally, it offers robust support for running executables of --user-installed gems.. Its downsides are that it is only available in bash and zsh shells, and that other tools"
      },
      InputSearchResult {
        url: "https://www.jetbrains.com/help/ruby/ruby-version-managers.html",
        title: "Ruby version managers | RubyMine Documentation - JetBrains",
        content: "Ruby version managers. The most popular way to install Ruby on Linux or macOS is using a version manager, for example, RVM or rbenv. Version managers allow you to install several Ruby versions on your machine and quickly switch between them. RubyMine automatically detects interpreters installed on a local machine and maintained by the following"
      },
      InputSearchResult {
        url: "https://libs.tech/ruby/version-managers",
        title: "Top Ruby Version Managers 2025 - libs.tech",
        content: "Top Ruby Version Managers 2025 GitHub Libraries → Ruby → Version Managers. A/B Testing Libraries 1 Admin Libraries 3 AI / ML Libraries 1 Analytics Libraries 3 Architecture Libraries 4 Auth Libraries 8 Autocomplete Libraries 1 AWS Libraries 1 BDD Libraries 2 Benchmarking Tools 1 Caching Libraries 1 Charting Libraries 3"
      },
      InputSearchResult {
        url: "https://www.alchemists.io/articles/ruby_version_managers/",
        title: "Ruby Version Managers - Alchemists",
        content: "Ruby Install, by the way, is a specialized tool for installing different versions of Ruby. While Frum has this functionality baked in, what's nice about Ruby Install — or Frum — is you don't have to wait for any updates to frum, chruby or ruby-install in order to download and install a Ruby version. As long as the Ruby core team has published a versioned download, you're good to go!"
      },
      InputSearchResult {
        url: "https://www.reddit.com/r/ruby/comments/wnvprq/what_is_the_recommended_ide_coding_environment/",
        title: "What is the recommended IDE / coding environment for Ruby on a ... - Reddit",
        content: "WSL2 plus a Ruby version manager like RVM (does a lot of setup for you, including prerequisites), rbenv, asdf, or chruby. Be forewarned, there are — for some reason beyond my comprehension — people with very strong opinions in which you should use. My lightly held opinion is the beginners will probably find RVM easiest, because it goes out of its way to do things like install dependencies"
      },
      InputSearchResult {
        url: "https://metova.com/choosing-a-ruby-version-management-tool-rbenv-vs-rvm/",
        title: "Choosing a Ruby Version Management Tool: rbenv vs RVM",
        content: "RVM comes with its own Ruby installation mechanism: rvm install ruby-2.3.0. With rbenv, you can either install Ruby yourself (by saving to ~/.rbenv/versions) or make use of ruby-build, a plugin that will install the versions for you. Like rbenv, ruby-build has a homebrew recipe. brew install ruby-build rbenv install 2.3.0"
      },
      InputSearchResult {
        url: "https://rvm.io/",
        title: "RVM: Ruby Version Manager - RVM Ruby Version Manager - Documentation",
        content: "Any Ruby based application will benefit from your use of RVM. Testing. RVM enables you to easily test both upgrade and escape paths very easily and consistently. With RVM, you can run a test suite, rake tasks, benchmarks and gem commands against multiple ruby versions at the same time."
      }
    ],
    userProfileSynopsis #"
      I am a technical architect at a consulting firm.  My day-day to duties involve API design, creating internal tools in ruby, system design, devops, and general programming as necessary.
      I am skilled in most areas but ruby is a particularly new area for me. I have experience with python, java, javascript, typescript, and golang. 
      I know AWS fairly well but Azure is pretty lacking. In terms of devops I am familiar with Gitlab CI and Jenkins but not much else.
      Much of my day to day involves API design via open api specifications. But a fair bit of it also involves creating internal tooling using core ruby (meaning not ruby on rails)
    "#
  }
}

