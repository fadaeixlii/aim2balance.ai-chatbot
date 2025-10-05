# Ticket: Implement Usage Metrics Components

**Epic:** [Dashboard & Wallet Implementation](./dashboard_implementation_roadmap.md)
**Feature:** User Dashboard

## 1. User Story

**As a user, I want to see a breakdown of my token usage** by provider and project so that I can understand where my credits are being spent and identify high-consumption areas.

## 2. Acceptance Criteria

-   A **Usage Summary** component is created, featuring a date range filter (e.g., "Last 7 days," "Last 30 days").
-   The summary component must display the total tokens used and the total cost for the selected period.
-   A **Provider Breakdown** component must display a donut chart showing the percentage and total tokens used for each AI provider (e.g., OpenAI, Anthropic).
-   A **Project Breakdown** component must display a horizontal bar chart showing token usage for each project/agent.
-   A **Detailed Usage Table** must be present, showing a paginated and sortable log of individual AI interactions.
-   The table must include the following columns: `Date`, `Project Name`, `Model`, `Input Tokens`, `Output Tokens`, `Total Tokens`, and `Cost`.
-   All components on the dashboard must update dynamically when the date range filter is changed.

## 3. Technical Implementation Details

### a. Frontend

-   **Components:** Create the following new React components:
    -   `UsageSummary.tsx`
    -   `ProviderBreakdownChart.tsx`
    -   `ProjectBreakdownChart.tsx`
    -   `UsageLogTable.tsx`
-   **State Management:** Use a shared state management solution (like Zustand or Recoil) to manage the global date range filter so that all components can react to its changes.
-   **Data Fetching:**
    -   Use `react-query` to fetch data from the new backend endpoints (`/api/usage/*`).
    -   Queries should be parameterized with the selected date range and re-fetch when it changes.
-   **Dependencies:**
    -   `@tremor/react` for `DonutChart`, `BarChart`, `Table`, and other UI elements.

**Example (using Tremor):**

```jsx
import { Card, Title, DonutChart, BarChart, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';

// Provider Breakdown Component
function ProviderBreakdownChart({ data }) {
  return (
    <Card>
      <Title>Usage by Provider</Title>
      <DonutChart
        className="mt-6"
        data={data}
        category="tokens"
        index="providerName"
        colors={["cyan", "blue", "indigo"]}
      />
    </Card>
  );
}

// Project Breakdown Component
function ProjectBreakdownChart({ data }) {
  return (
    <Card>
      <Title>Usage by Project</Title>
      <BarChart
        className="mt-6"
        data={data}
        index="projectName"
        categories={["tokens"]}
        colors={["blue"]}
        layout="horizontal"
      />
    </Card>
  );
}
```

### b. Backend

-   **API Endpoints:** Create the following new, authenticated endpoints:
    -   `GET /api/usage/summary?range=<period>`: Returns `{ totalTokens, totalCost }`.
    -   `GET /api/usage/breakdown?by=provider&range=<period>`: Returns an array of `{ providerName, tokens }`.
    -   `GET /api/usage/breakdown?by=project&range=<period>`: Returns an array of `{ projectName, tokens }`.
    -   `GET /api/usage/log?range=<period>&page=<num>`: Returns a paginated array of detailed interaction logs.
-   **Logic:** The endpoints must query the `RequestEvent` data, aggregate it based on the request parameters, and return the structured JSON response.

## 4. Definition of Done

-   All four new components (`UsageSummary`, `ProviderBreakdownChart`, `ProjectBreakdownChart`, `UsageLogTable`) are created and integrated into the dashboard.
-   The components correctly fetch and visualize data from the backend.
-   The date range filter is implemented and correctly updates all components.
-   The detailed usage table is sortable and paginated.
-   All backend endpoints are created, tested, and deployed.
