# Plan for the Usage Tracking and Invoicing Module

This document outlines the architectural plan for implementing the aim2balance.ai concept as a new module within the rebranded LibreChat application.

## 1. Backend Development

### 1.1. Data Model and Database Schema

A new MongoDB collection, named `UsageMetrics`, will be created to store detailed information about each AI interaction. Each document in this collection will have the following structure:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId", // Reference to the user
  "model": "string", // The AI model used (e.g., 'gpt-4', 'claude-2')
  "promptTokens": "number",
  "completionTokens": "number",
  "totalTokens": "number",
  "timestamp": "Date",
  "energyKwh": "number", // Calculated energy consumption
  "waterLiters": "number", // Calculated water consumption
  "m2Restored": "number" // Calculated restoration impact
}
```

### 1.2. Data Tracking and Calculation Logic

-   **Middleware for Tracking:** A new middleware function will be created in the Express.js backend. This middleware will intercept the response from the AI model providers.
-   **Data Extraction:** It will extract the `userId`, the `model` used, and the token counts (`prompt_tokens`, `completion_tokens`) from the API response.
-   **Impact Calculation:**
    -   A configurable mapping will be created (likely in `librechat.yaml`) to define the energy and water consumption per 1,000 tokens for each AI model. *Initial values will need to be researched, but making them configurable is key.*
    -   The middleware will calculate `energyKwh`, `waterLiters`, and `m2Restored` based on these factors.
    -   The final `UsageMetrics` document will be saved to the database.

### 1.3. New API Endpoints

Two new API endpoints will be created:

-   `GET /api/usage/summary`: This endpoint will return aggregated usage data for the currently authenticated user for a given time period (e.g., the current month). The response will include total tokens, total kWh, total liters, and total m² restored.

-   `GET /api/usage/history`: This endpoint will provide a paginated history of the user's interactions, allowing for a more detailed breakdown over time.

## 2. Frontend Development

### 2.1. New UI Components

New React components will be developed to display the impact data:

-   **Impact Dashboard:** A new page or a section in the user's profile will be created to host the dashboard. This will be the central place for users to see their impact.
-   **Non-Payer View Component:** This component will display the "restoration potential." It will use the data from the `/api/usage/summary` endpoint to show what could be restored if the user subscribed.
-   **Payer View Component:** This component will show the actual impact made. It will visualize the total "m² restored" and could include charts showing the impact over time, using data from both `/api/usage/summary` and `/api/usage/history`.

### 2.2. State Management

-   **TanStack React Query:** New queries will be added to fetch data from the new API endpoints. This will handle caching and data synchronization automatically.

## 3. Invoicing and Billing

### 3.1. Monthly Invoicing Process

-   **Scheduled Job:** A scheduled job (e.g., a cron job running on the server) will be created to run at the end of each month.
-   **Invoice Generation:** This job will:
    1.  Query the `UsageMetrics` collection to aggregate the total `m2Restored` for each paying user for the month.
    2.  Calculate the total amount due based on a configurable price per m².
    3.  Integrate with a payment provider (like Stripe or PayPal) to generate and send an invoice to the user.

-   **User Status:** The user's payment status (`isPayer`) will be stored in the `User` model in the database.

This plan provides a clear path forward for developing the new module. The next step would be to start implementing these changes, beginning with the backend data model and middleware.
