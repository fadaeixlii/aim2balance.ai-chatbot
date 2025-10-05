# Frontend Implementation Guide

This guide provides a step-by-step plan for building the "Impact Dashboard" and integrating it into the LibreChat frontend.

## 1. Create the API Service

First, we need to create a service to fetch the usage data from the new backend endpoints.

In the `client/src/data-provider` directory, create a new file named `mutations/useGetUsage.js` (or similar) to define the API calls:

```javascript
import { useQuery } from '@tanstack/react-query';
import { axios } from '~/utils';

export const useGetUsageSummary = () => {
  return useQuery(['usageSummary'], () => axios.get('/api/usage/summary').then(res => res.data));
};

export const useGetUsageHistory = () => {
  return useQuery(['usageHistory'], () => axios.get('/api/usage/history').then(res => res.data));
};
```

## 2. Build the UI Components

Next, we'll create the React components that will display the impact data. These should be placed in a new directory at `client/src/components/Impact/`.

-   **`ImpactDashboard.tsx`**: This will be the main component that fetches the data using the new hooks and displays the appropriate view (payer or non-payer).
-   **`PayerView.tsx`**: A component that visualizes the "m² restored" data, perhaps with charts and graphs.
-   **`NonPayerView.tsx`**: A component that displays the "restoration potential" and includes a call-to-action to upgrade.

## 3. Add the New Route

Now, we'll add a new route for the Impact Dashboard.

Open `client/src/routes/Dashboard.tsx` and add a new route object to the `children` array:

```javascript
// ... inside the children array of dashboardRoutes
{
  path: 'impact',
  element: <ImpactDashboard />,
},
// ...
```

## 4. Add a Link to the Navigation

To allow users to access the new page, we need to add a link to the dashboard's sidebar.

Open `client/src/components/Prompts/Groups/GroupSidePanel.tsx` (or a more appropriate shared navigation component if one is identified) and add a new `NavLink` to the Impact Dashboard:

```jsx
// Example of what to add inside the navigation component
<NavLink
  to="/d/impact"
  className={/* ... existing styles ... */}
>
  <YourImpactIcon />
  <span>Impact</span>
</NavLink>
```

## 5. State Management

-   **TanStack React Query:** The `useQuery` hooks we created in step 1 will handle all the data fetching, caching, and state management for the usage data.
-   **User's Payment Status:** The user's payment status (`isPayer`) will need to be available in the frontend. This should be added to the user object that is returned from the `/api/auth/login` and `/api/user/me` endpoints. The `ImpactDashboard` component will use this to decide whether to render the `PayerView` or the `NonPayerView`.

This completes the frontend implementation plan. The result will be a new, fully integrated "Impact Dashboard" that visually represents the user's environmental impact based on their AI usage.
