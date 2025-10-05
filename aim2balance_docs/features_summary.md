# LibreChat Features Summary

This document summarizes the key features of the LibreChat platform, based on its official documentation.

## Core AI & Advanced Capabilities

-   **Multi-Model Support:** Extensive integration with a wide array of AI models from providers like OpenAI, Azure, Anthropic, Google, AWS Bedrock, and open-source alternatives like Ollama, Groq, and Mistral AI.
-   **Code Interpreter API:** A secure, sandboxed environment to execute code in multiple languages (Python, JS, Go, etc.), handle file uploads/downloads, all without privacy concerns.
-   **Agents:** Build no-code, custom AI assistants that can use various tools (e.g., DALL-E, calculators, web search) and work with any supported model.
-   **Web Search:** Integrated web search capabilities to provide up-to-date information in conversations.
-   **Persistent Memory:** The ability for the AI to remember context across different conversations for a more personalized experience. This is a configurable feature.
-   **Model Context Protocol (MCP):** A universal protocol to connect AI models with any external tool or service, enabling dynamic and context-aware interactions.
-   **Artifacts:** The ability to generate UI elements like React components, HTML, and Mermaid diagrams directly within the chat.

## Content and Conversation Management

-   **Multimodal Chat:** Interact with models using text, images (analysis), and files.
-   **Image Generation & Editing:** Create and edit images using providers like DALL-E, Stable Diffusion, and others.
-   **Conversation Branching:** Edit, resubmit, and fork messages to explore different conversational paths without losing context.
-   **Custom Presets:** Create, save, and share personalized configurations for different AI models and settings.
-   **Dynamic Model Switching:** Switch between different AI models and presets in the middle of a conversation.
-   **Temporary Chat:** An incognito mode for private conversations that are not saved to your history.
-   **Import/Export:** Import conversations from other platforms (like ChatGPT) and export them in various formats (Markdown, JSON, Screenshot).

## User Interface and Experience

-   **Intuitive UI:** A user-friendly interface inspired by ChatGPT, including a dark mode.
-   **Hands-Free Chat:** Support for Speech-to-Text and Text-to-Speech for voice-based interaction.
-   **Multilingual UI:** The interface is available in numerous languages.
-   **Customizable Interface:** The UI can be adapted to suit both power users and beginners.
-   **Advanced Search:** Powerful search functionality, powered by Meilisearch, to find specific messages or conversations.

## Security and Administration

-   **Secure Authentication:** Robust multi-user authentication system with support for local logins, OAuth (Google, GitHub, etc.), SAML, and LDAP/Active Directory.
-   **Email Verification & Password Reset:** Standard security features for user account management.
-   **Token Usage Management:** Tools for administrators to monitor and manage AI token consumption.
-   **Comprehensive Configuration:** Extensive options for configuring every aspect of the platform, from AI endpoints to security settings.

## Deployment and Development

-   **Flexible Deployment:** Can be deployed locally for offline use or in the cloud for scalability. Supports Docker for easy setup.
-   **Open-Source:** A community-driven project with transparent development.
