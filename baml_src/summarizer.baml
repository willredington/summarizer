// Defining a data model.
class SummaryResult {
  url string @description("The url of the provided source")
  error string? @description("An error message if the url is invalid or you're unable to read from the url")
  title string? @description("A user-friendly title for the source")
  topic string? @description("Describes the overall topic of the source")
  summary string? @description("A brief summary of the provided source")
  tags string[]? @description("A list of tags that relate or describe the source, tags should all be lowercased and hyphenated")
  sections Section[]? @description("A topic may have multiple sections, each section is a major topic of the source")
  practicalApplication string? @description("This should be a highly condensed version of the content that is applicable to user.")
}

class Section {
  title string @description("The title of the section")
  summary string @description("A brief summary of the section")
  codeExamples CodeExample[]? @description("If this section has any relevant code examples")
  mainBulletPoints string[]? @description("The main bullet points of the section")
}

class CodeExample {
  codeExample string
  language string @description(#"
    the coding language used
  "#)
}

function GenerateSummary(url: string, userProfileSynopsis: string) -> SummaryResult {
  client Anthropic
  prompt #"
    You are a helpful assistant that summarizes webpages.
    You will be given a url and you will need to summarize the webpage.

    Here is the url:
    {{ url }}

    You should summarize the webpage in a way that is useful to the user.  
    Your summary should be as relevant as possible to the user.  

    Here is are the details about the user including their job and job functions:
    {{ userProfileSynopsis }}
    
    You will need to return the summary in the following format:
    {{ ctx.output_format }}
  "#
}

test my_summary {
  functions [GenerateSummary]
  args {
    url "https://www.honeybadger.io/blog/ruby-dry-schema/"
    userProfileSynopsis #"
      I am a technical architect at a consulting firm.  My day-day to duties involve API design, creating internal tools in ruby, system design, devops, and general programming as necessary.
      I am skilled in most areas but ruby is a particularly new area for me. I have experience with python, java, javascript, typescript, and golang. 
      I know AWS fairly well but Azure is pretty lacking. In terms of devops I am familiar with Gitlab CI and Jenkins but not much else.
      Much of my day to day involves API design via open api specifications. But a fair bit of it also involves creating internal tooling using core ruby (meaning not ruby on rails)
    "#
  }
}