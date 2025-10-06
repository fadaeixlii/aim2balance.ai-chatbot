# Agents & Tools Analysis

This document provides a deep dive into LibreChat's Agents framework, explaining how they are built, what tools they can use, and how they can be customized and shared.

## 1. System Architecture

LibreChat's agent system is built on top of **LangChain**, a powerful framework for developing applications with large language models. This allows for the creation of complex agents that can reason, use tools, and complete multi-step tasks.

-   **Frontend:** The UI provides a "no-code" agent builder where users can define an agent's properties, including its name, role (system prompt), and the specific tools it has access to.
-   **Backend:** The main Node.js API uses LangChain to orchestrate the agent's execution. When a user interacts with an agent, the backend initializes the LangChain agent with the specified model, tools, and prompt.

## 2. The No-Code Agent Builder

One of the key features of LibreChat is its user-friendly agent builder, which allows users to create custom agents without writing any code. In the UI, a user can:

-   **Define the Agent's Role:** Write a system prompt that gives the agent its personality, instructions, and goals (e.g., "You are a web research assistant who specializes in summarizing articles.").
-   **Select Tools:** Choose from a list of available tools that the agent is allowed to use. This is a critical step that defines the agent's capabilities.
-   **Set Model Parameters:** Configure the specific AI model, temperature, and other parameters for the agent.

## 3. Available Tools

LibreChat comes with a rich set of pre-built tools that can be enabled through environment variables in the `.env` file. These tools give agents the ability to interact with the outside world and perform complex tasks.

### Key Tools:

-   **File Search (`file_search`):**
    -   **Functionality:** Allows the agent to perform semantic search across user-uploaded documents.
    -   **Integration:** This tool directly queries the `rag_api` service, as detailed in the RAG analysis document.

-   **Web Search:**
    -   **Functionality:** A comprehensive web search tool that enables agents to find and read information from the internet.
    -   **Integration:** It uses a multi-stage process:
        1.  **Search Provider:** Uses a service like **Serper** (`SERPER_API_KEY`) to get a list of relevant URLs.
        2.  **Scraper:** Uses a service like **Firecrawl** (`FIRECRAWL_API_KEY`) to extract the content from the web pages.
        3.  **Reranker (Optional):** Uses a service like **Jina** or **Cohere** to rerank the search results for relevance.

-   **Code Interpreter:**
    -   **Functionality:** Provides the agent with a sandboxed Python environment to execute code. This is extremely powerful for data analysis, calculations, and other programmatic tasks.
    -   **Integration:** It connects to the official LibreChat Code Interpreter API (`LIBRECHAT_CODE_API_KEY`).

-   **Other Third-Party Tools:**
    -   **WolframAlpha (`WOLFRAM_APP_ID`):** For computational knowledge and real-time data.
    -   **Zapier (`ZAPIER_NLA_API_KEY`):** To connect to thousands of other web apps and services.
    -   **DALL-E:** For generating images.

## 4. Agent Presets

LibreChat supports the creation of default agent "presets" that are available to all users. This is ideal for providing pre-configured agents for common tasks (e.g., a "Web Researcher," a "File Q&A Bot").

-   **How it works:** Agent presets are defined in a configuration file on the backend. When the application starts, it loads these presets and makes them available in the agent marketplace.
-   **Customization:** You can define 2-3 default agents as requested in the project brief by creating a configuration file that specifies their roles, prompts, and pre-selected tools. For example:
    -   **Web-Research Agent:** An agent with a prompt geared towards research and with the **Web Search** tool enabled.
    -   **File-QA Agent:** An agent with a prompt focused on answering questions from documents and with the **File Search** tool enabled.
    -   **Image-QA Agent:** An agent using a vision-capable model (like GPT-4o) with a prompt designed to answer questions about uploaded images.

By creating these presets, you can provide immediate value to users and showcase the platform's capabilities without requiring them to build agents from scratch.
