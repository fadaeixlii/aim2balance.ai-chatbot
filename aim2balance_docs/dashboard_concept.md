# User Dashboard Concept for aim2balance.ai

This document outlines the concept for the main user dashboard, which will serve as the central hub for managing billing, usage, and other key features of the aim2balance.ai platform.

## 1. Executive Summary

The dashboard will provide users with a clear, at-a-glance overview of their account status, including:

-   **Wallet Balance:** The current balance of their token credits.
-   **Usage Metrics:** Detailed breakdowns of token consumption by provider, model, and project.
-   **Cost Analysis:** Translation of token usage into actual costs.
-   **Sustainability Metrics:** (Future goal) Visualizations of the user's carbon footprint and restoration efforts.

This concept builds on the assumption that a basic dashboard layout has been initiated by Kai, and it provides the next layer of detail for the required components.

## 2. Dashboard Layout & Components

The dashboard will be a new, full-page view accessible from the main user menu, as identified in the UI/UX audit. It will be composed of the following key components:

### a. Wallet & Billing Component

-   **Purpose:** To provide a clear view of the user's current balance and allow them to manage their funds.
-   **Key Information:**
    -   **Current Balance:** Displayed prominently in a large font (e.g., "1,234,567 tokens").
    -   **Estimated Value:** A smaller sub-text showing the approximate dollar value of the token balance.
-   **Actions:**
    -   **"Add Credits" Button:** A primary call-to-action that links to the Stripe billing portal.
    -   **"Billing History" Link:** A secondary link to a detailed transaction history page.

### b. Usage Summary Component

-   **Purpose:** To give users a quick overview of their token consumption over a specific period.
-   **Key Information:**
    -   **Date Range Filter:** A dropdown allowing users to select a time frame (e.g., "Last 7 days," "Last 30 days," "Month to Date").
    -   **Total Tokens Used:** A summary metric for the selected period.
    -   **Total Cost:** The corresponding cost for the tokens used.

### c. Usage Breakdown by Provider

-   **Purpose:** To show users which AI providers are consuming the most tokens.
-   **Visualization:** A donut chart or bar graph is ideal for this.
-   **Data Points:**
    -   Each slice/bar represents a provider (e.g., OpenAI, Anthropic, Google).
    -   The value of each slice/bar is the number of tokens used for that provider.
    -   A legend should clearly label each provider and show the corresponding token count.

### d. Usage Breakdown by Project

-   **Purpose:** To help users understand which of their projects (agents) is driving the most usage.
-   **Visualization:** A horizontal bar chart is effective here.
-   **Data Points:**
    -   Each bar represents a project/agent.
    -   The length of the bar corresponds to the total tokens used by that project.
    -   The bar can be segmented to show the provider mix for that project (e.g., how many OpenAI vs. Anthropic tokens were used).

### e. Detailed Usage Table

-   **Purpose:** To provide a granular, sortable log of recent activity.
-   **Columns:**
    -   `Date`
    -   `Project/Agent Name`
    -   `Model Used` (e.g., `gpt-4-turbo`, `claude-3-opus`)
    -   `Input Tokens`
    -   `Output Tokens`
    -   `Total Tokens`
    -   `Cost`

## 3. Future-Scope: Sustainability Metrics

While not part of the MVP, the dashboard should be designed with a dedicated space for future sustainability metrics. This component will eventually include:

-   **Estimated Carbon Footprint:** A visualization of the environmental impact of the user's token consumption.
-   **Restoration Impact:** A metric showing the positive impact of the user's contributions (e.g., trees planted, carbon offset).

## 4. Technical Implementation Notes

-   **Data Fetching:** The dashboard will rely on new API endpoints that provide aggregated usage data from the backend.
-   **State Management:** A state management library (like Recoil or Zustand) will be needed to manage the dashboard's state, such as the selected date range.
-   **Charting Library:** A library like `Recharts` or `Chart.js` will be required for the data visualizations.
