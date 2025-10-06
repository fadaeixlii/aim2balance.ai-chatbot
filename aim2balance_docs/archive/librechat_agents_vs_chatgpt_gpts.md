# Comparison: LibreChat Agents vs. ChatGPT GPTs/Projects

This document provides a detailed comparison between the "Agents" feature in LibreChat and the "GPTs" feature in OpenAI's ChatGPT. The goal is to inform the design and implementation of a "Projects UI" for the aim2balance.ai platform.

## 1. Executive Summary

- **LibreChat Agents** are open-source, highly customizable, and self-hostable entities built on the LangChain framework. They offer deep integration with a variety of tools and a dedicated RAG API, giving you full control over the data and architecture.
- **ChatGPT GPTs** are a proprietary, user-friendly feature within the OpenAI ecosystem. They are easy to create and share but offer less architectural control and are tied to OpenAI's platform.

For aim2balance.ai, the goal of a **"Projects UI"** is to create a user-friendly workspace for managing LibreChat's powerful but more technical "Agents," effectively bridging the gap to offer a user experience similar to ChatGPT's Projects.

## 2. Feature Comparison

| Feature                  | LibreChat Agents                                                                                                      | ChatGPT GPTs (Projects)                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Underlying Framework** | **LangChain:** Open-source and highly flexible. Allows for complex, custom agent logic and tool integration.          | **Proprietary (OpenAI):** A closed-source framework. Easy to use but less flexible and prone to vendor lock-in.                        |
| **Customization**        | **Deep & Technical:** Users define a system prompt and select from a list of pre-configured tools in the UI.          | **Conversational & Guided:** Users create GPTs through a conversational interface ("GPT Builder") that writes the instructions.        |
| **Knowledge (RAG)**      | **Dedicated RAG API:** Uses a separate microservice (`rag_api`) with a configurable vector database (pgvector, etc.). | **Integrated "Knowledge" Upload:** Users upload files directly into the GPT editor. The underlying RAG process is a black box.         |
| **Tools & Capabilities** | **Extensible Tools:** Supports a wide range of tools (Web Search, Code Interpreter, Zapier, etc.) enabled via `.env`. | **Built-in & Custom Actions:** Provides built-in capabilities (Browsing, DALL-E) and allows calling external APIs via OpenAPI schemas. |
| **UI & Creation**        | **Agent Builder:** A form-based UI to define the agent's prompt, model, and select tools.                             | **GPT Editor:** A two-panel UI with a conversational builder and a preview pane for instant testing.                                   |
| **Sharing & Access**     | **Internal:** Agents are created for personal use within the LibreChat instance. No public sharing mechanism.         | **Flexible:** GPTs can be private, shared via a direct link, or published to the public GPT Store.                                     |
| **Hosting & Data**       | **Self-Hosted:** You have full control over the infrastructure, data storage (S3, Azure), and vector database.        | **Cloud-Hosted (OpenAI):** All data, including uploaded knowledge files, is stored on OpenAI's servers.                                |

## 3. The "Projects UI" Concept for aim2balance.ai

To bridge the gap between LibreChat's powerful but technical agent system and the user-friendly experience of ChatGPT, we will introduce the concept of **"Projects."**

- **A "Project" is a user-facing workspace.** It's a container for a specific goal or task (e.g., "Q3 Marketing Report," "My Personal Website Codebase").
- **An "Agent" is a backend entity.** Each agent has a specific personality, instruction set, and set of tools. A project can contain one or more specialized agents.

This abstraction allows users to think in terms of "Projects" while leveraging the power of customized agents behind the scenes.

## 4. User Stories for the MVP

- **As a user, I want to create a new Project** so that I can organize my work around a specific goal.
- **As a user, I want to view all my Projects** in a central dashboard to easily navigate my work.
- **As a user, I want to create a new Agent within a Project** so I can have a specialized AI assistant for that project's tasks.
- **As a user, I want to start a conversation with an Agent within a Project** and have that conversation history automatically saved to the project.
- **As a user, I want to see all conversations and agents associated with a Project** when I open its workspace.

## 5. Actionable Implementation Plan

This plan is structured into epics and stories that can be directly used to create development tickets.

### **Epic 1: Backend Project Management**

_Goal: Build the core backend functionality for creating and managing projects._

- **Story 1.1: Define `Project` Model**

  - **Task:** Create a new Mongoose schema for `Project`.
  - **Fields:** `name` (String), `description` (String), `owner` (ObjectID, ref: 'User'), `agents` ([ObjectID], ref: 'Agent'), `conversations` ([ObjectID], ref: 'Conversation').

- **Story 1.2: Develop Project CRUD API**
  - **Task:** Create a new set of REST API endpoints in `api/server/routes/`.
  - **Endpoints:**
    - `POST /api/projects`: Create a new project.
    - `GET /api/projects`: List all projects for the authenticated user.
    - `GET /api/projects/:id`: Get details for a single project (including its agents and conversations).
    - `PUT /api/projects/:id`: Update a project's name or description.
    - `DELETE /api/projects/:id`: Delete a project.

### **Epic 2: Frontend "Projects" UI**

_Goal: Build the user-facing interface for interacting with projects._

- **Story 2.1: Create the Projects Dashboard**

  - **Task:** Build a new page, accessible from the main user menu, that displays a grid or list of the user's projects.
  - **Components:** Project Card (summary view), "Create New Project" button.

- **Story 2.2: Develop the Project Workspace**
  - **Task:** Create a dedicated page for a single project, accessible by clicking a project card.
  - **Components:**
    - Project header (displaying name and description).
    - A list or grid of agents belonging to the project.
    - A list of conversations associated with the project.
    - "Create Agent" and "Start New Chat" buttons scoped to the current project.

### **Epic 3: Integration with Core Workflows**

_Goal: Seamlessly connect the new Projects feature with the existing agent and conversation flows._

- **Story 3.1: Update Agent Creation Flow**

  - **Task:** Modify the "Agent Builder" UI.
  - **Change:** Add a dropdown menu to the builder that allows the user to assign the new agent to one of their existing projects. The `agent.save` endpoint will need to be updated to handle this association.

- **Story 3.2: Link Conversations to Projects**
  - **Task:** When a user starts a new conversation with an agent _from within a project workspace_, the system must automatically associate the new `conversationId` with the parent `projectId`.
  - **Change:** The `POST /api/conversations` or equivalent endpoint will need to be updated to accept an optional `projectId` in its payload.
