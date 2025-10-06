# Billing Implementation: Stripe & Wallet

This guide provides a detailed plan for integrating Stripe to manage the prepaid credit wallet.

## Part 1: Stripe Setup

1.  **Create a Product:** In your [Stripe Dashboard](https://dashboard.stripe.com/), create a new product named "aim2balance Credits."
2.  **Add a Price:** Add a price to this product. For a simple top-up system, you can set a price of €1.00. We will use the `quantity` parameter in the Checkout session to determine the top-up amount.
3.  **Get API Keys:** Get your **Publishable Key** and **Secret Key** from the Stripe dashboard.
4.  **Set Environment Variables:** Add your Stripe keys to the `.env` file of the **Impact Service** (the Node.js worker).

    ```
    STRIPE_SECRET_KEY=sk_test_YourSecretKey
    STRIPE_WEBHOOK_SECRET=whsec_YourWebhookSecret
    ```

## Part 2: Backend Implementation (Impact Service)

We will add two new endpoints to our Node.js Impact Service: one to create a Stripe Checkout session and another to handle the webhook for successful payments.

### 1. Create Checkout Session Endpoint

This endpoint will be called by the frontend when a user decides to top up their wallet.

```javascript
// In impact-service/index.js

app.post('/api/create-checkout-session', async (req, res) => {
    const { userId, amount } = req.body; // amount in EUR

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: 'price_YourPriceIdHere', // The Price ID from your Stripe dashboard
                quantity: amount,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        metadata: {
            userId: userId,
        },
    });

    res.json({ id: session.id });
});
```

### 2. Create Webhook Endpoint

This endpoint will listen for events from Stripe, specifically the `checkout.session.completed` event, which confirms a successful payment.

```javascript
// In impact-service/index.js

app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const amount = session.amount_total / 100; // Amount is in cents

        // 1. Update the user's balance in Supabase
        const { error: balanceError } = await supabase.rpc('add_credits', { 
            user_id_input: userId, 
            amount_input: amount 
        });

        if (balanceError) {
            console.error('Error updating balance:', balanceError);
            // Optionally, handle the error, e.g., by flagging for manual review
        } else {
            // 2. Create a 'topup' transaction record
            await supabase.from('transactions').insert([
                { user_id: userId, type: 'topup', amount_eur: amount, metadata: { stripeSessionId: session.id } },
            ]);
        }
    }

    res.json({received: true});
});

// Helper function in Supabase SQL Editor to safely add credits
/*
CREATE OR REPLACE FUNCTION add_credits(user_id_input UUID, amount_input NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE balances
    SET credits_eur = credits_eur + amount_input
    WHERE user_id = user_id_input;

    IF NOT FOUND THEN
        INSERT INTO balances (user_id, credits_eur) VALUES (user_id_input, amount_input);
    END IF;
END;
$$ LANGUAGE plpgsql;
*/
```

## Part 3: Frontend Implementation

### 1. Create the Top-up Modal

Create a `TopUpModal.tsx` component that allows the user to select a top-up amount and initiates the checkout process.

```jsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_YourPublishableKey');

export default function TopUpModal({ userId }) {
  const [amount, setAmount] = useState(20);

  const handleCheckout = async () => {
    const stripe = await stripePromise;

    // Call your backend to create the Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });

    const session = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <div>
      <h2>Add Credits</h2>
      {/* ... UI to select amount ... */}
      <button onClick={handleCheckout}>Top up €{amount}</button>
    </div>
  );
}
```

### 2. Add the Top-up Button

In `client/src/components/Nav/AccountSettings.tsx`, add a new `SelectItem` that opens the `TopUpModal`.

```jsx
// ... in AccountSettings.tsx
const [showTopUp, setShowTopUp] = useState(false);

// ... in the JSX
<Select.SelectItem onClick={() => setShowTopUp(true)} className="select-item text-sm">
  <YourIcon />
  <span>Add Credits</span>
</Select.SelectItem>

{showTopUp && <TopUpModal userId={user?.id} />}
```
