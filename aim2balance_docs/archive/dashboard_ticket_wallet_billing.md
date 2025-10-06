# Ticket: Implement Wallet & Billing Component

**Epic:** [Dashboard & Wallet Implementation](./dashboard_implementation_roadmap.md)
**Feature:** User Dashboard

## 1. User Story

**As a user, I want to see my current token balance** and be able to easily add more credits so that I can manage my spending on the platform.

## 2. Acceptance Criteria

-   A "Wallet" component is displayed prominently at the top of the user dashboard.
-   The component must display the user's current token balance in a large, clear font.
-   A sub-text showing the estimated monetary value of the token balance (e.g., "~€45.67") must be displayed.
-   A primary call-to-action button labeled "Add Credits" must be present.
-   Clicking the "Add Credits" button must redirect the user to a Stripe checkout portal.
-   A secondary link labeled "View History" must be present, which will eventually link to a transaction history page.
-   The component should include a progress bar to visually indicate the health of the balance (e.g., green for high, red for low).

## 3. Technical Implementation Details

### a. Frontend

-   **Component:** Create a new React component, `WalletCard.tsx`, in the new dashboard section.
-   **Styling:** Use Tailwind CSS and Tremor's `Card` component to build the UI.
-   **Data Fetching:**
    -   Use `react-query` to fetch data from the new `GET /api/user/balance` endpoint.
    -   The query should be re-fetched automatically after a successful top-up transaction.
-   **Dependencies:**
    -   `@tremor/react` for the `Card` and `ProgressBar` components.

**Example (using Tremor):**

```jsx
import { Card, Metric, Text, ProgressBar } from '@tremor/react';

function WalletCard() {
  // Fetch balance data from API
  const { data: balance, isLoading } = useUserBalanceQuery();

  return (
    <Card className="max-w-xs mx-auto">
      <Text>Wallet Balance</Text>
      <Metric>{new Intl.NumberFormat().format(balance?.tokens ?? 0)} tokens</Metric>
      <Text className="mt-2">~€{balance?.fiatValue.toFixed(2)}</Text>
      <ProgressBar value={balance?.percentage} color="emerald" className="mt-4" />
      <Button primary onClick={() => redirectToStripe()}>Add Credits</Button>
    </Card>
  );
}
```

### b. Backend

-   **API Endpoint:** Create a new endpoint `GET /api/user/balance`.
-   **Logic:**
    -   The endpoint must be authenticated.
    -   It should retrieve the current user's token balance from the database.
    -   It should calculate the estimated fiat value based on a predefined conversion rate.
    -   It should return a JSON object with `tokens`, `fiatValue`, and `percentage` (for the progress bar).

## 4. Definition of Done

-   The `WalletCard` component is created and integrated into the dashboard page.
-   The component correctly fetches and displays the user's balance.
-   The "Add Credits" button successfully redirects to the Stripe portal.
-   The component is responsive and matches the design brief.
-   The backend endpoint is created, tested, and deployed.
