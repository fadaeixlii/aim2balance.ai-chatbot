# Backend Implementation Guide

This guide provides a detailed, step-by-step plan for modifying the LibreChat backend to track AI token usage and calculate its environmental impact, based on the `aim2balance.ai` concept.

## 1. Create the `UsageMetric` Model

First, we need a new database model to store our impact data. Following the project's structure, we'll create a new schema and a model file.

**A. Create the Schema File:**

Create a new file at `packages/data-schemas/src/schema/usageMetric.ts` with the following content:

```typescript
import mongoose from 'mongoose';
import { z } from 'zod';

export const UsageMetricSchema = z.object({
  user: z.string(),
  model: z.string(),
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
  energyKwh: z.number(),
  waterLiters: z.number(),
  m2Restored: z.number(),
});

export type IUsageMetric = z.infer<typeof UsageMetricSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const usageMetricSchema = new mongoose.Schema<IUsageMetric>(
  {
    user: {
      type: String,
      index: true,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    promptTokens: {
      type: Number,
      required: true,
    },
    completionTokens: {
      type: Number,
      required: true,
    },
    totalTokens: {
      type: Number,
      required: true,
    },
    energyKwh: {
      type: Number,
      required: true,
    },
    waterLiters: {
      type: Number,
      required: true,
    },
    m2Restored: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default usageMetricSchema;
```

**B. Create the Model File:**

Create a new file at `packages/data-schemas/src/models/usageMetric.ts`:

```typescript
import usageMetricSchema, { IUsageMetric } from '~/schema/usageMetric';

export function createUsageMetricModel(mongoose: typeof import('mongoose')) {
  return (
    mongoose.models.UsageMetric || mongoose.model<IUsageMetric>('UsageMetric', usageMetricSchema)
  );
}
```

**C. Update the Model Index:**

Open `packages/data-schemas/src/models/index.ts` and add the new model to the exports.

## 2. Add Configuration for Impact Factors

We need to define the environmental cost per token for each model. These should be configurable.

Open `librechat.example.yaml` and add a new section:

```yaml
aim2balance:
  # Energy in kWh per 1,000 tokens
  energyFactor: 0.02
  # Water in Liters per 1,000 tokens
  waterFactor: 0.5
  # m² restored per 1,000 tokens
  m2RestoredFactor: 0.001
  # Model-specific overrides
  models:
    'gpt-4':
      energyFactor: 0.04
      waterFactor: 1.0
      m2RestoredFactor: 0.002
```

The backend will need to be updated to load this new section from the config file.

## 3. Hook into the Transaction System

The most efficient place to add our tracking logic is within the existing transaction system, which is already called every time tokens are used.

**A. Create a New `UsageMetric` Service:**

Create a new file at `api/models/UsageMetric.js`:

```javascript
const { UsageMetric } = require('~/db/models');
const { getAppConfig } = require('~/server/services/Config');

async function recordUsage(txData, tokenUsage) {
  const { user, model } = txData;
  const { promptTokens, completionTokens } = tokenUsage;
  const totalTokens = promptTokens + completionTokens;

  const config = (await getAppConfig()).aim2balance;
  const modelConfig = config.models?.[model] || {};

  const energyFactor = modelConfig.energyFactor || config.energyFactor;
  const waterFactor = modelConfig.waterFactor || config.waterFactor;
  const m2RestoredFactor = modelConfig.m2RestoredFactor || config.m2RestoredFactor;

  const usageMetric = new UsageMetric({
    user,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    energyKwh: (totalTokens / 1000) * energyFactor,
    waterLiters: (totalTokens / 1000) * waterFactor,
    m2Restored: (totalTokens / 1000) * m2RestoredFactor,
  });

  await usageMetric.save();
}

module.exports = { recordUsage };
```

**B. Modify the `spendTokens` function:**

Open `api/models/spendTokens.js` and import the new `recordUsage` function. Then, call it within the `spendTokens` function.

```javascript
const { recordUsage } = require('./UsageMetric'); // Add this import

const spendTokens = async (txData, tokenUsage) => {
  // ... existing code ...
  try {
    // ... existing code to create transactions ...

    // Add this call to record the usage metric
    if (txData.user) { // Ensure it's a user transaction
      await recordUsage(txData, tokenUsage);
    }

  } catch (err) {
    logger.error('[spendTokens]', err);
  }
};
```

## 4. Create the New API Endpoints

Finally, create the API endpoints to serve the usage data to the frontend.

**A. Create the Controller:**

Create a new file at `api/server/controllers/UsageController.js` to handle the logic for fetching and aggregating the data from the `UsageMetric` collection.

**B. Create the Router:**

Create a new file at `api/server/routes/usage.js` to define the `/summary` and `/history` endpoints. This router will use the new controller.

**C. Register the Router:**

In `api/server/index.js`, register the new router:

```javascript
// ... inside startServer function, with other app.use() calls
app.use('/api/usage', routes.usage);
```

And in `api/server/routes/index.js`, export it:

```javascript
// ...
const usage = require('./usage');

module.exports = {
  // ...
  usage,
};
```

This completes the backend implementation. The system will now automatically track the environmental impact of every AI interaction.
