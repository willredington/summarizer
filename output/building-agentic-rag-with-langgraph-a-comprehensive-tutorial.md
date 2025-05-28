# Building Agentic RAG with LangGraph: A Comprehensive Tutorial

# Agentic RAG with LangGraph Tutorial

## Overview

This tutorial demonstrates building an **agentic RAG (Retrieval-Augmented Generation)** system using LangGraph, where an agent can make decisions about when and how to retrieve information rather than following a fixed retrieval pattern.

## Key Concepts

### Traditional RAG vs Agentic RAG
- **Traditional RAG**: Fixed flow of retrieve → generate
- **Agentic RAG**: Agent decides whether retrieval is necessary based on the query

## Implementation Architecture

### 1. State Definition

```python
from typing import Annotated, Literal, TypedDict
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages

class GraphState(TypedDict):
    """State of the agent graph."""
    messages: Annotated[list[AnyMessage], add_messages]
```

### 2. Core Components

#### Document Indexing
```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load and split documents
loader = WebBaseLoader(urls)
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)

# Create vector store
vectorstore = Chroma.from_documents(
    documents=splits,
    collection_name="rag-chroma",
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()
```

#### Grade Documents Tool
```python
class GradeDocuments(BaseModel):
    """Binary score for relevance check."""
    binary_score: str = Field(description="Documents are relevant - 'yes' or 'no'")

llm_with_tool = llm.with_structured_output(GradeDocuments)

def grade_documents(state: GraphState) -> Literal["generate", "rewrite"]:
    """Determines whether retrieved documents are relevant."""
    # Grade each document
    filtered_docs = []
    for d in documents:
        score = llm_with_tool.invoke(prompt)
        if score.binary_score == "yes":
            filtered_docs.append(d)
    
    return "generate" if filtered_docs else "rewrite"
```

### 3. Agent Workflow Graph

```python
from langgraph.graph import END, StateGraph, START

workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("agent", agent)  # Primary agent
workflow.add_node("retrieve", retrieve)  # Retrieval
workflow.add_node("rewrite", rewrite)  # Query rewriting
workflow.add_node("generate", generate)  # Generate answer

# Define edges
workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent",
    route_question,
    {
        "websearch": "retrieve",
        "generate": "generate",
    },
)
workflow.add_conditional_edges(
    "retrieve",
    grade_documents,
    {
        "generate": "generate",
        "rewrite": "rewrite",
    },
)
workflow.add_edge("generate", END)
workflow.add_edge("rewrite", "agent")

# Compile
graph = workflow.compile()
```

### 4. Key Functions

#### Agent Decision Router
```python
def route_question(state: GraphState) -> Literal["websearch", "generate"]:
    """Route question to web search or direct generation."""
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        return "websearch"
    else:
        return "generate"
```

#### Query Rewriter
```python
def rewrite(state: GraphState):
    """Transform query to produce better retrieval."""
    messages = state["messages"]
    question = messages[0].content
    
    msg = llm.invoke([
        HumanMessage(content=f"""Improve this question for web search: {question}""")
    ])
    
    return {"messages": [msg]}
```

## Execution Flow

1. **Agent receives query** → Decides if retrieval is needed
2. **If retrieval needed** → Fetch documents
3. **Grade documents** → Check relevance
4. **If relevant** → Generate answer
5. **If not relevant** → Rewrite query and retry

## Usage Example

```python
inputs = {"messages": [HumanMessage(content="What is Task Decomposition?")]}

for output in graph.stream(inputs):
    for key, value in output.items():
        print(f"Output from node '{key}':")
        print(value)
```

## Key Advantages

1. **Adaptive Retrieval**: Only retrieves when necessary
2. **Quality Control**: Grades document relevance
3. **Self-Correction**: Can rewrite queries for better results
4. **Flexible Architecture**: Easy to extend with additional tools/nodes

## API Design Considerations

For implementing similar patterns in Ruby:
- Use state machines (e.g., AASM gem) for workflow management
- Implement clear interfaces for each component (agent, retriever, grader)
- Consider async processing for retrieval operations
- Design modular components that can be easily tested and swapped

## System Design Notes

- **Stateful Design**: Uses TypedDict for type-safe state management
- **Graph-based Architecture**: Nodes represent operations, edges define flow
- **Conditional Routing**: Dynamic path selection based on outputs
- **Tool Integration**: Seamlessly integrates with LangChain tools

This architecture provides a robust foundation for building intelligent RAG systems that can adapt their behavior based on the context and quality of retrieved information.

## Tags
- LangGraph
- RAG
- AI Agents
- Python
- LLM
- Retrieval-Augmented Generation
- State Machines
- OpenAI
- Vector Search