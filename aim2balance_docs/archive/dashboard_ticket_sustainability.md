# Ticket: Implement Sustainability Metrics Component (Future Scope)

**Epic:** [Dashboard & Wallet Implementation](./dashboard_implementation_roadmap.md)
**Feature:** User Dashboard

## 1. User Story

**As a user, I want to understand the environmental impact of my AI usage** and see the positive contributions from my rebalancing fees, so that I can be more mindful of my digital footprint.

## 2. Acceptance Criteria

-   A new, expandable section or tab for "Sustainability" is added to the dashboard.
-   The component must display the user's estimated carbon footprint (e.g., "0.5 kg CO2e this month").
-   The carbon footprint should be translated into relatable equivalents (e.g., "Equivalent to 5 cheeseburgers" or "24 trees needed to offset").
-   The component must display the positive restoration impact funded by the user's 2.5% rebalancing fee (e.g., "You've funded 0.1 m² of ecosystem restoration").
-   Visualizations such as pie charts or trend bars should be used to display the data in an engaging way.

## 3. Technical Implementation Details

### a. Frontend

-   **Component:** Create a new React component, `SustainabilityMetrics.tsx`.
-   **Styling:** Use Tailwind CSS and Tremor's `Card`, `Title`, and chart components.
-   **Data Fetching:**
    -   Use `react-query` to fetch data from a new `GET /api/sustainability/metrics` endpoint.
    -   The query should be parameterized with the selected date range from the dashboard's global filter.
-   **Dependencies:**
    -   `@tremor/react` for `Card`, `DonutChart`, `BarList`, and `Tracker` components.

**Example (using Tremor):**

```jsx
import { Card, Title, Text, DonutChart, BarList, Tracker } from '@tremor/react';

function SustainabilityMetrics({ data }) {
  return (
    <Card>
      <Title>Your Impact</Title>
      <Text>Estimated CO2e this month: {data.co2e.value} kg</Text>
      <DonutChart
        className="mt-6"
        data={data.equivalents}
        category="value"
        index="name"
        variant="pie"
      />
      <Title className="mt-6">Restoration Funded</Title>
      <Text>{data.restoration.value} m²</Text>
      <Tracker data={data.restoration.tracker} className="mt-2" />
    </Card>
  );
}
```

### b. Backend

-   **API Endpoint:** Create a new endpoint `GET /api/sustainability/metrics?range=<period>`.
-   **Logic:**
    -   This endpoint will be the most complex, requiring the **Impact Service** to be fully operational.
    -   It must query the `RequestEvent` data for the user within the given date range.
    -   For each event, it will sum the calculated `kWh`, `L`, and `CO2e` values.
    -   It will also sum the `m²` of restoration funded by the rebalancing fees.
    -   The endpoint will return a structured JSON object containing the aggregated data and calculated equivalents.

## 4. Definition of Done

-   The `SustainabilityMetrics` component is created and integrated into the dashboard.
-   The component correctly fetches and visualizes data from the backend.
-   The component updates based on the global date range filter.
-   The backend endpoint is created, tested, and deployed.
-   The data is presented in a clear, engaging, and easy-to-understand manner.
