# Dashboard & Wallet Implementation Roadmap

This document outlines the high-level roadmap for implementing the user dashboard, wallet, and billing sections for aim2balance.ai. It is designed to be the central epic, linking to detailed, ticket-ready stories for each major component.

## 1. Technology & Dependencies

To build the interactive charts and data visualizations required for the dashboard, a new dependency is needed.

-   **Recommended Charting Library:** **[Tremor](https://www.tremor.so/)**
    -   **Reasoning:** Tremor is a modern React library specifically designed for building dashboards with Tailwind CSS. It is incredibly easy to use, looks great out of the box, and aligns perfectly with the existing tech stack.
    -   **Action:** The first step of implementation will be to add this library to the project.

    ```bash
    npm install @tremor/react
    ```

## 2. Implementation Epics & Stories

This project is broken down into three main user-facing components, each with its own detailed implementation ticket.

### Epic 1: Wallet & Billing

-   **Goal:** Provide users with a clear view of their token balance and a seamless way to add credits.
-   **Detailed Ticket:** **[Wallet & Billing Component](./dashboard_ticket_wallet_billing.md)**

### Epic 2: Usage Metrics & Monitoring

-   **Goal:** Allow users to track their token consumption by provider, project, and model.
-   **Detailed Ticket:** **[Usage Metrics Components](./dashboard_ticket_usage_metrics.md)**

### Epic 3: Sustainability & Impact (Future Scope)

-   **Goal:** Visualize the user's environmental impact and the positive contributions from their usage.
-   **Detailed Ticket:** **[Sustainability Metrics Component](./dashboard_ticket_sustainability.md)**

## 3. Backend API Requirements

The frontend dashboard will require several new backend endpoints to supply the necessary data. These should be developed in parallel with the UI components.

-   `GET /api/user/balance`: Returns the user's current token balance and its estimated fiat value.
-   `GET /api/user/transactions`: Returns a paginated list of the user's billing history.
-   `GET /api/usage/summary?range=<period>`: Returns total tokens used and cost for a given period.
-   `GET /api/usage/breakdown?by=<provider|project>&range=<period>`: Returns aggregated usage data grouped by the specified dimension.
-   `GET /api/usage/log?range=<period>`: Returns a detailed, paginated log of all AI interactions.
