# UI Mockups & Detailed Component List

This document provides low-fidelity mockups and a detailed component list for the aim2balance.ai UI, as requested in the project brief for Mohamed's kick-off tasks.

## 1. Low-Fidelity Mockups

These text-based mockups illustrate the layout and flow of the new UI components.

### Frame 1: Updated User Menu

This mockup shows the new **Balance** display and the **Add Credits** button within the existing user menu in `AccountSettings.tsx`.

```text
+----------------------------------------+
| [Avatar] John Doe                      |
+----------------------------------------+
| johndoe@example.com                    |
|----------------------------------------|
| Balance: €12.34                        |
|----------------------------------------|
| [Icon] My Files                        |
| [Icon] Add Credits   -> Opens Top-up Modal |
| [Icon] Settings                        |
|----------------------------------------|
| [Icon] Log Out                         |
+----------------------------------------+
```

### Frame 2: Top-up Modal & Flow

This shows the modal for adding credits and the subsequent success/failure pages.

**Initial State (TopUpModal.tsx):**
```text
+----------------------------------------+
| Add Credits to Your Wallet             |
|----------------------------------------|
|                                        |
|  Select amount:                        |
|  [ €10 ]  [ €20 ]  [ €50 ]  [ Custom ]  |
|                                        |
|  You will be redirected to Stripe to   |
|  complete your purchase.               |
|                                        |
|  [ Top up €20 ]   [ Cancel ]           |
+----------------------------------------+
```

**Success/Failure State (Redirect Pages):**
```text
+----------------------------------------+
| [Icon] Payment Successful!             |
|----------------------------------------|
|                                        |
|  €20 has been added to your wallet.    |
|                                        |
|  [ Back to Chat ]                      |
+----------------------------------------+
```

### Frame 3: Impact Dashboard (User View)

This mockup illustrates the main user-facing Impact Dashboard with key counters and charts.

```text
+--------------------------------------------------------------------------+
| Impact Dashboard                                [ Date Range: Last 30 Days ] |
+--------------------------------------------------------------------------+
|                                                                          |
|  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
|  | m² Restored     |  | Energy Used     |  | Water Used      |  | CO₂e Emitted    | |
|  | 4.72            |  | 1.25 kWh        |  | 2.5 L           |  | 0.8 kg          | |
|  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
|                                                                          |
|  +----------------------------------------------------------------------+ |
|  | Impact Over Time (m²)                               [ Export as PNG ] | |
|  |                                                                      | |
|  |    /\                                                                | |
|  |   /  \_                                                               | |
|  |  /     \                                                              | |
|  | /       \/\                                                            | |
|  |/          \                                                           | |
|  +----------------------------------------------------------------------+ |
|                                                                          |
|  +----------------------------------------------------------------------+ |
|  | Breakdown by Model                                    [ Export as CSV ] | |
|  | +------------------+---------+---------+---------+-----------------+ | |
|  | | Model            | m²      | kWh     | L       | CO₂e            | | |
|  | +------------------+---------+---------+---------+-----------------+ | |
|  | | gpt-4            | 2.10    | 0.60    | 1.1     | 0.4             | | |
|  | | claude-3-haiku   | 1.52    | 0.40    | 0.8     | 0.2             | | |
|  | | mixtral-8x7b     | 1.10    | 0.25    | 0.6     | 0.2             | | |
|  | +------------------+---------+---------+---------+-----------------+ | |
|  +----------------------------------------------------------------------+ |
+--------------------------------------------------------------------------+
```

## 2. Detailed Component List

This section details the props for the new React components.

### `BalanceDisplay`

-   **Description:** A small component to fetch and display the user's credit balance.
-   **Props:**
    -   `userId: string` - The ID of the current user.

### `TopUpModal`

-   **Description:** A modal for handling the Stripe Checkout flow.
-   **Props:**
    -   `isOpen: boolean` - Controls the visibility of the modal.
    -   `onClose: () => void` - Function to close the modal.
    -   `userId: string` - The ID of the user to associate with the Stripe session.

### `ImpactDashboard` (Page)

-   **Description:** The main page for displaying impact metrics.
-   **Props:**
    -   `userId: string` - The ID of the user whose data is being displayed.
    -   `isAdminView: boolean` (optional) - If true, fetches data for all users.

### `ImpactStatCard`

-   **Description:** A reusable card to display a single key metric (e.g., m² restored).
-   **Props:**
    -   `title: string` - The title of the metric (e.g., "m² Restored").
    -   `value: number | string` - The value of the metric.
    -   `unit: string` (optional) - The unit for the value (e.g., "kWh").

### `ImpactChart`

-   **Description:** A time-series chart for visualizing impact data.
-   **Props:**
    -   `data: { date: string; value: number }[]` - The data points for the chart.
    -   `dataKey: string` - The key to use for the y-axis (e.g., "m2").
    -   `title: string` - The title of the chart.

### `ModelBreakdownTable`

-   **Description:** A table to show impact metrics broken down by model.
-   **Props:**
    -   `data: { model: string; m2: number; kwh: number; l: number; co2e: number }[]` - The aggregated data for the table.
