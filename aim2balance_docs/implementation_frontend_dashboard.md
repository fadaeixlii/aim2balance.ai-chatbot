# Frontend Implementation: Impact Dashboard

This guide provides a detailed plan for building the user-facing Impact Dashboard to visualize the data from our new backend.

## Part 1: Connecting to the Supabase Backend

We will use the official Supabase client library to fetch data directly from our Supabase tables within LibreChat's frontend.

### 1. Install Supabase Client

In the `client` directory, add the Supabase client library:

```bash
npm install @supabase/supabase-js
# or
bun add @supabase/supabase-js
```

### 2. Create the Supabase API Service

Create a new file at `client/src/data-provider/supabase.js` to initialize the client and define our data-fetching hooks.

```javascript
import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook to get aggregated impact data for the current user
export const useGetImpactSummary = (userId) => {
  return useQuery(
    ['impactSummary', userId],
    async () => {
      const { data, error } = await supabase
        .from('request_events')
        .select('kwh, l, co2e, m2')
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      // Aggregate the data on the client-side for simplicity
      return data.reduce(
        (acc, row) => ({
          kwh: acc.kwh + row.kwh,
          l: acc.l + row.l,
          co2e: acc.co2e + row.co2e,
          m2: acc.m2 + row.m2,
        }),
        { kwh: 0, l: 0, co2e: 0, m2: 0 },
      );
    },
    { enabled: !!userId },
  );
};

// Hook to get the user's balance
export const useGetUserBalance = (userId) => {
    return useQuery(
        ['userBalance', userId],
        async () => {
            const { data, error } = await supabase
                .from('balances')
                .select('credits_eur')
                .eq('user_id', userId)
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        { enabled: !!userId },
    );
};
```

## Part 2: Building the UI Components

As outlined in the UI research, we will add the new UI elements to the existing navigation and create a new page for the dashboard.

### 1. Display Balance in User Menu

Modify `client/src/components/Nav/AccountSettings.tsx` to use the new `useGetUserBalance` hook and display the balance in EUR.

```jsx
// ... in AccountSettings.tsx
const { user } = useAuthContext();
const { data: balanceData } = useGetUserBalance(user?.id);

// ... in the JSX, replace the old balance display with:
<div className="text-token-text-secondary ml-3 mr-2 py-2 text-sm" role="note">
  Balance: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(balanceData?.credits_eur ?? 0)}
</div>
```

### 2. Create the Impact Dashboard Page

Create a new file at `client/src/components/Impact/ImpactDashboard.tsx`.

```jsx
import { useGetImpactSummary } from '~/data-provider/supabase';
import { useAuthContext } from '~/hooks';

export default function ImpactDashboard() {
  const { user } = useAuthContext();
  const { data: summary, isLoading } = useGetImpactSummary(user?.id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Your Impact</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="stat-card">
          <h2 className="stat-title">m² Restored</h2>
          <p className="stat-value">{summary?.m2.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h2 className="stat-title">Energy Used</h2>
          <p className="stat-value">{summary?.kwh.toFixed(2)} kWh</p>
        </div>
        {/* ... more stat cards for water and CO2 ... */}
      </div>
      {/* ... Add charts and tables here ... */}
    </div>
  );
}
```

### 3. Add the Route and Navigation Link

1.  **Add the Route:** In `client/src/routes/Dashboard.tsx`, add a new route for the Impact Dashboard:
    ```javascript
    {
      path: 'impact',
      element: <ImpactDashboard />,
    },
    ```
2.  **Add the Nav Link:** In `client/src/components/Nav/Nav.tsx`, add a new button or link that navigates to `/d/impact`.
