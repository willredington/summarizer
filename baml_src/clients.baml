// Learn more about clients at https://docs.boundaryml.com/docs/snippets/clients/overview
client<llm> OpenAI {
  provider "openai"
  options {
    api_key env.OPENAI_API_KEY
    model "gpt-4o-mini"
    temperature 0.1
  }
}

client<llm> Anthropic {
  provider "anthropic"
  options {
    api_key env.ANTHROPIC_API_KEY
    model "claude-opus-4-20250514"
    temperature 0.1
  }
}