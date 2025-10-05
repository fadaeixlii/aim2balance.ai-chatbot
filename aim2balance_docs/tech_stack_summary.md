# LibreChat Technology Stack Summary

This document provides a high-level overview of the technology stack used in the LibreChat project.

## Monorepo Architecture

LibreChat utilizes a monorepo architecture, with the codebase organized into three main workspaces:

-   `api`: The backend server, built with Node.js and Express.
-   `client`: The frontend application, built with React.
-   `packages`: Shared libraries and utilities used across the project.

This structure is managed using npm workspaces, and the project supports both `npm` and `bun` for package management and script execution.

## Frontend (Client)

-   **Framework:** React
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS
-   **UI Components:** A combination of Headless UI, Radix UI, and Ariakit, allowing for the creation of highly customizable and accessible user interfaces.
-   **State Management:** A mix of Recoil, Jotai, and TanStack React Query for efficient state and data management.
-   **Routing:** React Router
-   **Forms:** React Hook Form with Zod for validation.

## Backend (API)

-   **Framework:** Express.js
-   **Database:** MongoDB with Mongoose.
-   **Authentication:** Passport.js with JWT, supporting various OAuth providers.
-   **AI/LLM Integrations:** Extensive support for multiple AI models and platforms, including:
    -   OpenAI
    -   Anthropic (Claude)
    -   Google (Gemini, Vertex AI)
    -   Ollama (for local models)
    -   LangChain framework
-   **Caching:** Redis
-   **Search:** Meilisearch
-   **File Storage:** AWS S3 and Azure Blob Storage

## Development & Deployment

-   **Containerization:** Docker and Docker Compose are used for creating a consistent development and production environment.
-   **Testing:** The project includes a comprehensive testing suite using Jest, React Testing Library, and Playwright for end-to-end testing.
-   **Linting & Formatting:** ESLint and Prettier are used to maintain code quality and consistency.
