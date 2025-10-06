# Billing System Implementation Guide

This guide outlines how to implement a monthly billing system based on the tracked environmental impact. We will use **Stripe** as the payment provider and **node-cron** for scheduling.

## 1. Install Dependencies

First, add the necessary libraries to the backend's `package.json`:

```bash
npm install stripe node-cron
# or
bun add stripe node-cron
```

## 2. Configure Stripe

1.  **Get API Keys:** Sign up for a Stripe account and get your **Publishable Key** and **Secret Key**.
2.  **Set Environment Variables:** Add your Stripe secret key to the `.env` file in the root of the project:

    ```
    STRIPE_SECRET_KEY=sk_test_YourSecretKey
    ```

3.  **Create a Product in Stripe:** In your Stripe dashboard, create a new "Product." Then, add a "Price" to this product. This will represent the cost per "m² restored." For example, you could set a price of €1 per m².

## 3. Update the User Model

We need to store the user's payment status and their Stripe customer ID.

Modify the `User` schema in `packages/data-schemas/src/schema/user.ts` to include these new fields:

```typescript
// ... inside the user schema definition
isPayer: {
  type: Boolean,
  default: false,
},
stripeCustomerId: {
  type: String,
  index: true,
  unique: true,
  sparse: true, // Allows multiple null values
},
// ...
```

## 4. Create the Billing Service

Create a new file at `api/server/services/BillingService.js` to handle all the billing logic.

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, UsageMetric } = require('~/db/models');

async function generateMonthlyInvoices() {
  const payingUsers = await User.find({ isPayer: true, stripeCustomerId: { $exists: true } });

  for (const user of payingUsers) {
    // 1. Calculate usage for the last month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const usage = await UsageMetric.aggregate([
      { $match: { user: user._id.toString(), createdAt: { $gte: lastMonth } } },
      { $group: { _id: null, totalM2Restored: { $sum: '$m2Restored' } } },
    ]);

    if (usage.length === 0 || usage[0].totalM2Restored <= 0) {
      continue; // No usage, no invoice
    }

    const totalM2Restored = usage[0].totalM2Restored;

    // 2. Create an invoice item in Stripe
    await stripe.invoiceItems.create({
      customer: user.stripeCustomerId,
      // The price ID from your Stripe dashboard
      price: 'price_YourPriceIdHere',
      quantity: Math.ceil(totalM2Restored), // Stripe quantities must be integers
    });

    // 3. Create and send the invoice
    await stripe.invoices.create({
      customer: user.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
    });
  }
}

module.exports = { generateMonthlyInvoices };
```

## 5. Create the Scheduled Job

Now, we'll create a scheduled job that runs once a month to generate the invoices.

Create a new file at `api/server/jobs/billing.js`:

```javascript
const cron = require('node-cron');
const { generateMonthlyInvoices } = require('~/server/services/BillingService');

// Schedule to run at midnight on the 1st day of every month
const billingJob = cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly billing job...');
  try {
    await generateMonthlyInvoices();
    console.log('Monthly billing job completed successfully.');
  } catch (error) {
    console.error('Error running monthly billing job:', error);
  }
});

module.exports = billingJob;
```

## 6. Start the Job

Finally, start the billing job when the server starts.

In `api/server/index.js`, import and start the job:

```javascript
// ... with other imports
const billingJob = require('./jobs/billing');

// ... inside the startServer function, after the server is listening
app.listen(port, host, async () => {
  // ...
  billingJob.start();
  logger.info('Billing job scheduled.');
});
```

This completes the implementation of the billing system. It will now automatically generate and send invoices to paying users at the beginning of each month based on their AI usage in the previous month.
