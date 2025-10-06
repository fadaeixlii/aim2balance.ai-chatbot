# Backend Implementation: LiteLLM & Impact Service

This guide provides a detailed plan for setting up the backend infrastructure, including the Supabase database and the Node.js Impact Service.

## Part 1: Setting up the Supabase Backend

Supabase will serve as our primary data store for user data, transactions, and impact telemetry.

### 1. Create a New Supabase Project

1.  Go to the [Supabase Dashboard](https://app.supabase.io/) and create a new project.
2.  Once the project is created, navigate to the **SQL Editor**.

### 2. Define the Database Schema

Run the following SQL queries in the Supabase SQL Editor to create the necessary tables based on the data model defined in the project brief.

**Users & Settings:**
```sql
-- Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'member',
    -- Other user-specific fields from LibreChat's user model
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB
);
```

**Billing & Transactions:**
```sql
-- Create Balances Table (part of the user table or separate)
CREATE TABLE balances (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    credits_eur NUMERIC(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL, -- 'topup', 'spend', 'refund'
    amount_eur NUMERIC(10, 2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Impact Telemetry:**
```sql
-- Create RequestEvents Table
CREATE TABLE request_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    ts TIMESTAMPTZ NOT NULL,
    model TEXT NOT NULL,
    provider TEXT NOT NULL,
    tokens_in INT,
    tokens_out INT,
    cost_eur NUMERIC(10, 6),
    kwh NUMERIC(10, 6),
    l NUMERIC(10, 6),
    co2e NUMERIC(10, 6),
    m2 NUMERIC(10, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Donations Table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month DATE NOT NULL,
    amount_eur NUMERIC(10, 2) NOT NULL,
    m2_restored NUMERIC(10, 2),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Part 2: Building the Impact Service

The Impact Service is a small Node.js worker that will receive telemetry data from LiteLLM, calculate the environmental impact, and save it to the Supabase database.

### 1. Project Setup

Create a new Node.js project:

```bash
mkdir impact-service
cd impact-service
npm init -y
npm install express @supabase/supabase-js dotenv
```

### 2. Service Structure

-   **`index.js`**: The main entry point. It will set up the Express server and define the API endpoint to receive data from LiteLLM.
-   **`supabaseClient.js`**: A module to initialize and export the Supabase client.
-   **`impactCalculator.js`**: A module containing the logic to calculate kWh, liters, CO₂, and m² based on the incoming token data and model coefficients.

### 3. API Endpoint (`index.js`)

This endpoint will receive the `RequestEvent` payload from the LiteLLM callback.

```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { calculateImpact } = require('./impactCalculator');
require('dotenv').config();

const app = express();
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.post('/api/request-event', async (req, res) => {
    const eventData = req.body;

    // 1. Calculate the impact metrics
    const impact = calculateImpact(eventData);

    // 2. Create the full RequestEvent object
    const newEvent = {
        user_id: eventData.userId,
        ts: eventData.ts,
        model: eventData.model,
        provider: eventData.provider,
        tokens_in: eventData.tokens_in,
        tokens_out: eventData.tokens_out,
        cost_eur: eventData.costEUR,
        kwh: impact.kwh,
        l: impact.waterLiters,
        co2e: impact.co2e,
        m2: impact.m2Restored,
    };

    // 3. Save to Supabase
    const { error } = await supabase.from('request_events').insert([newEvent]);

    if (error) {
        console.error('Error saving RequestEvent:', error);
        return res.status(500).send('Error saving event');
    }

    res.status(201).send('Event recorded');
});

const PORT = process.env.PORT || 3090;
app.listen(PORT, () => console.log(`Impact Service running on port ${PORT}`));
```

This completes the backend setup plan. The next step will be to build the frontend dashboard to visualize this data.
