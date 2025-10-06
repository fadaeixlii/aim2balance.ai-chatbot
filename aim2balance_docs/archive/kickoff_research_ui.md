# Kick-off Research: UI/UX Audit & Component Plan

This document outlines the plan for extending the LibreChat UI to accommodate the new features for the aim2balance.ai platform.

## Goal

Audit the LibreChat UI to identify extension points for rebranding, the credit wallet, impact widgets, and admin screens. Sketch the component structure for the Impact Dashboard and the top-up flow.

## Part 1: UI Audit & Extension Points

This audit identifies the key files and components in the LibreChat UI that will be modified to implement the aim2balance.ai features.

### 1. Rebranding

-   **Main Logo:** The primary logo is located in `client/src/components/Nav/NewChat.tsx`. This component will need to be updated to display the new aim2balance.ai logo.
-   **App Title & Favicon:** The application title is set in `client/public/index.html`. This file should be updated with the new title and favicon.

### 2. Wallet / Balance Display

-   **Location:** The user's credit balance should be displayed in the main user menu.
-   **Component:** `client/src/components/Nav/AccountSettings.tsx`.
-   **Implementation:** This component already has a section for displaying the user's token balance (lines 54-62). This can be adapted to show the new credit wallet balance in EUR.

### 3. Top-up Button & Flow

-   **Location:** A "Top-up" or "Add Credits" button should be placed within the user menu.
-   **Component:** `client/src/components/Nav/AccountSettings.tsx`.
-   **Implementation:** A new `<Select.SelectItem>` can be added to this component. Clicking it will open a modal that hosts the Stripe Checkout flow.

### 4. Impact Dashboard Link

-   **Location:** A link to the new Impact Dashboard should be in the main navigation.
-   **Component:** `client/src/components/Nav/Nav.tsx`.
-   **Implementation:** A new navigation link can be added alongside the existing `NewChat`, `AgentMarketplaceButton`, and `BookmarkNav` components. This will likely involve creating a new `ImpactDashboardButton` component.

## Part 2: Component Plan

This section outlines the new components required for the MVP.

### 1. Impact Dashboard (`/impact`)

This will be a new page, likely added to the main router in `client/src/routes/index.tsx`.

-   **`ImpactDashboard.tsx` (Page Component):**
    -   Fetches and displays summary data (total m², kWh, L, CO₂e).
    -   Contains tabs for different views (e.g., "Summary," "By Model").
    -   Includes date range filters and an "Export to PDF/JSON" button.
-   **`ImpactChart.tsx` (Widget):**
    -   A reusable chart component (using a library like Recharts or Chart.js) to display time-series data.
-   **`ModelBreakdownTable.tsx` (Widget):**
    -   A table that shows impact metrics broken down by AI model and provider.

### 2. Top-up Flow (Stripe Checkout)

This flow will be handled within a modal to provide a seamless user experience.

-   **`TopUpModal.tsx` (Modal Component):**
    -   Triggered from the "Top-up" button in `AccountSettings.tsx`.
    -   Displays pre-set top-up amounts (e.g., €10, €20, €50).
    -   On selection, it initiates a call to the backend to create a Stripe Checkout session.
    -   Redirects the user to the Stripe Checkout page.
-   **`StripeSuccess.tsx` & `StripeCancel.tsx` (Callback Pages):**
    -   Simple pages to handle the redirect back from Stripe after a successful or canceled payment.
    -   These will display a success or failure message to the user.
