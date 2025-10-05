# aim2balance.ai: EU-Hosted Multi-Model Chat Platform

**One-liner:** Multi-model AI chat with built-in impact metering and automatic ecological rebalancing.

This document outlines the plan to build an EU-hosted, open-source chat platform by forking LibreChat. The platform will integrate footprint accounting (energy/water consumption converted to m² of restored ecosystems) and manage monthly donations to Bergwaldprojekt.

## 1. Primary Goals (MVP)

- **Multi-Model Chat:** Support for OpenAI, Anthropic, Google, Groq, OpenRouter, and local models via Ollama, all routed through a central proxy.
- **Dynamic Billing System:** A prepaid credit wallet (€20/month top-up), per-request spend enforcement, and a configurable markup (+15% margin + 2-3% rebalancing fee).
- **Impact Pipeline:** Capture per-request telemetry to estimate energy, water, and CO₂ usage, convert it to m² restored, and display it to the user.
- **Rebalancing Flow:** Automatically calculate and ledger monthly donations to Bergwaldprojekt.
- **Privacy & EU Hosting:** Ensure all data and services are hosted in the EU with strong security measures.

## 2. High-Level Architecture

- **UI/Web App:** A rebranded fork of LibreChat (React/Node).
- **LLM Gateway:** **LiteLLM Proxy** to handle authentication, routing, cost tracking, and rate limits for all AI providers.
- **Data Backend:** **Supabase** for application data (users, chats) and telemetry. S3-compatible storage for file uploads.
- **Billing:** **Stripe Checkout & Webhooks** to manage the prepaid credit wallet.
- **Impact Service:** A small Node.js worker to process telemetry from LiteLLM and calculate the environmental impact.

## 3. Data Model (MVP)

- `User`: {id, email, role, balances, prefs}
- `Transaction`: {id, userId, type: topup|spend|refund, amountEUR, metadata}
- `RequestEvent`: {id, userId, ts, model, provider, tokens_in/out, costEUR, kWh, L, CO₂e, m²}
- `Donation`: {id, month, amountEUR, m², receiptURL, notes}
- `Setting`: {key, value}

## 4. Project Documentation

This project is documented across several files, categorized by their purpose.

### 1. High-Level Overviews

- **[aim2balance Concept](./aim2balance_concept.md)**: The high-level vision and goals for the project.
- **[Features Summary](./features_summary.md)**: A summary of the key features for the MVP.
- **[Tech Stack Summary](./tech_stack_summary.md)**: An overview of the technologies and services used.

### 2. Architecture & Deep Dives

- **[Architecture and Data Flow](./architecture_and_data_flow.md)**: A description of the system architecture and how data moves between components.
- **[Backend Deep Dive](./backend_deep_dive.md)**: A deeper look into the backend components.
- **[Frontend Deep Dive](./frontend_deep_dive.md)**: A deeper look into the frontend components.

### 3. Feature Analysis & Setup Guides

- **[Configuration Guide](./configuration_guide.md)**: Complete reference for all LibreChat configuration options (.env and librechat.yaml), with simple and detailed explanations for each setting.
- **[Getting Free API Keys](./getting_free_api_keys.md)**: Step-by-step guide to obtain free API keys from Google Gemini, OpenRouter, Groq, and Anthropic for development and testing.
- **[Authentication Flow](./authentication_flow.md)**: Details on the user authentication and session management process.
- **[Social Logins Setup](./social_logins_setup.md)**: Guide for enabling social logins (Google, GitHub, etc.).
- **[Email & Notifications Setup](./email_and_notifications_setup.md)**: Guide for configuring transactional emails (Mailgun/SMTP).
- **[Token Usage Analysis](./token_usage_analysis.md)**: A detailed breakdown of how LibreChat handles token counting and billing.
- **[AI Model Integrations](./ai_model_integrations.md)**: Notes on integrating various AI models.
- **[UI Mockups & Detailed Component List](./ui_mockups_and_components.md)**: Low-fidelity mockups and a detailed component list with props.
- **[RAG & Vector Stores Analysis](./rag_and_vector_stores_analysis.md)**: A deep dive into the RAG API, vector databases, and file handling.
- **[Agents & Tools Analysis](./agents_and_tools_analysis.md)**: A deep dive into the Agents framework, tools, and presets.
- **[Comparison: LibreChat Agents vs. ChatGPT GPTs](./librechat_agents_vs_chatgpt_gpts.md)**: Analysis to guide the 'Projects UI' implementation.
- **[Custom Instructions & Personalization Analysis](./custom_instructions_personalization.md)**: Research and implementation plan for a personalization feature.
- **[RAG Cost Analysis](./rag_cost_analysis.md)**: A breakdown of the costs associated with the RAG system.
- **[Dashboard Concept](./dashboard_concept.md)**: A detailed concept for the user dashboard, wallet, and usage monitoring features.
- **[Analysis of `@librechat/client` Package](./packages_client_analysis.md)**: A deep dive into the shared frontend component library.

### 4. Implementation Guides

- **[Module Plan](./module_plan.md)**: The overall plan for the project's modules.
- **[Kick-off Research: LiteLLM Integration](./kickoff_research_litellm.md)**: Initial spike to validate the LiteLLM-LibreChat integration.
- **[Kick-off Research: UI/UX Audit](./kickoff_research_ui.md)**: Audit of the LibreChat UI to identify extension points.
- **[UI/UX Audit for Dashboard Integration](./ui_ux_audit.md)**: A focused audit to identify integration points for the user dashboard.
- **[Dashboard Implementation Roadmap](./dashboard_implementation_roadmap.md)**: The main epic and roadmap for building the user dashboard.
- **[Backend Implementation Guide](./implementation_backend_litellm.md)**: Guide for setting up the LLM gateway and the Node.js impact worker.
- **[Frontend Implementation Guide](./implementation_frontend_dashboard.md)**: Guide for building the user-facing dashboard and wallet UI.
- **[Billing Implementation Guide](./implementation_billing_stripe.md)**: Guide for integrating Stripe and managing the credit system.

### 5. Active Tasks

- **[Task: Usage/Balance Mapping & UI Component](./task_usage_balance_ui.md)**: Comprehensive task breakdown for mapping LibreChat's current usage/balance logic to aim2balance.ai's multi-tenant cost + environmental metering requirements, including gap analysis and UI component implementation.
- **[Gap 2: EUR Cost Tracking Analysis](./gap2_eur_cost_tracking_analysis.md)**: Detailed analysis of current token tracking implementation and comprehensive plan for implementing EUR-based cost tracking with provider markup and rebalancing fees.
- **[Balance & Credits System Explained](./balance_credits_explained.md)**: Simple explanation of how the balance and credits system works, including database structure, transaction flow, and user balance creation.

### 6. Archived & Legacy Guides

- **[Generic Backend Implementation](./implementation_backend.md)**: Older backend implementation notes.
- **[Generic Frontend Implementation](./implementation_frontend.md)**: Older frontend implementation notes.
- **[Generic Billing Implementation](./implementation_billing.md)**: Older billing implementation notes.
