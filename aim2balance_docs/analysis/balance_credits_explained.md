# Balance & Credits System - Simple Explanation

**For:** Developers new to the LibreChat billing system  
**Last Updated:** 2025-10-05

---

## 🎯 What is the Balance & Credits System?

The balance system tracks how much "credit" each user has to use AI models. Think of it like a **prepaid phone card** - users get credits, and each AI request costs some credits.

---

## 💰 How Credits Work

### The Basic Unit
```
1000 token credits = $0.001 USD (one-tenth of a cent)
```

This means:
- **1,000,000 credits** = $1.00 USD
- **10,000,000 credits** = $10.00 USD

### Why "Token Credits" Instead of Dollars?

LibreChat uses an abstract "token credit" system instead of real money for flexibility:
1. **Precision:** AI costs are tiny (fractions of a cent), so we need small units
2. **Provider-agnostic:** Different AI providers charge different rates
3. **Easy markup:** Admins can add margins without complex calculations

---

## 🏗️ Database Structure

### 1. Balance Collection

Each user has **ONE** balance document:

```javascript
{
  _id: ObjectId("..."),
  user: ObjectId("user123"),        // Link to User
  tokenCredits: 5000000,            // Current balance (= $5.00 USD)
  
  // Auto-refill settings (optional)
  autoRefillEnabled: true,
  refillAmount: 10000000,           // Add 10M credits ($10) each refill
  refillIntervalValue: 30,
  refillIntervalUnit: "days",       // Refill every 30 days
  lastRefill: ISODate("2025-01-01")
}
```

**Key Points:**
- ✅ One balance per user
- ✅ `tokenCredits` is the current wallet balance
- ✅ Auto-refill is optional (for subscription-like behavior)

---

### 2. Transaction Collection

Every AI request creates **TWO** transaction documents (one for prompt, one for completion):

```javascript
// Transaction 1: Prompt tokens
{
  _id: ObjectId("..."),
  user: ObjectId("user123"),
  conversationId: "conv456",
  tokenType: "prompt",              // This is the input
  model: "gpt-4o",
  rate: 2.5,                        // $2.5 per 1M tokens
  rawAmount: -1500,                 // Used 1500 tokens (negative = spent)
  tokenValue: -3750,                // Cost: 1500 * 2.5 = 3750 credits
  createdAt: ISODate("2025-01-05")
}

// Transaction 2: Completion tokens
{
  _id: ObjectId("..."),
  user: ObjectId("user123"),
  conversationId: "conv456",
  tokenType: "completion",          // This is the output
  model: "gpt-4o",
  rate: 10,                         // $10 per 1M tokens
  rawAmount: -800,                  // Generated 800 tokens
  tokenValue: -8000,                // Cost: 800 * 10 = 8000 credits
  createdAt: ISODate("2025-01-05")
}
```

**Key Points:**
- ✅ Two transactions per AI request (prompt + completion)
- ✅ `rawAmount` is negative (spending tokens)
- ✅ `tokenValue` is negative (deducting credits)
- ✅ `rate` is the USD price per 1M tokens

**Total cost of this request:**
- Prompt: 3,750 credits
- Completion: 8,000 credits
- **Total: 11,750 credits** (= $0.01175 USD)

---

## 🔄 How a Request Works (Step-by-Step)

### Example: User sends "Hello, how are you?" to GPT-4o

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User sends message                                  │
└─────────────────────────────────────────────────────────────┘
User types: "Hello, how are you?"
Frontend sends to: POST /api/ask/openAI

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Check if user has enough balance                   │
└─────────────────────────────────────────────────────────────┘
Backend calls: checkBalance()
  → Estimates prompt tokens: ~5 tokens
  → Looks up rate for gpt-4o: $2.5 per 1M tokens
  → Calculates cost: 5 * 2.5 = 12.5 credits
  → Checks: user.balance >= 12.5 credits? ✅ Yes
  
If NO → Reject request with error: "Insufficient balance"

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Send request to OpenAI                             │
└─────────────────────────────────────────────────────────────┘
Backend → OpenAI API: "Hello, how are you?"
OpenAI responds: "I'm doing well, thank you! How can I help?"

OpenAI also returns token usage:
  {
    prompt_tokens: 5,
    completion_tokens: 12
  }

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Record token usage (create transactions)           │
└─────────────────────────────────────────────────────────────┘
Backend calls: spendTokens(txData, { promptTokens: 5, completionTokens: 12 })

This creates TWO transactions:

Transaction 1 (Prompt):
  - rawAmount: -5 tokens
  - rate: 2.5 (USD per 1M tokens)
  - tokenValue: -12.5 credits
  - Saves to database ✅

Transaction 2 (Completion):
  - rawAmount: -12 tokens
  - rate: 10 (USD per 1M tokens)
  - tokenValue: -120 credits
  - Saves to database ✅

┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Update user balance                                │
└─────────────────────────────────────────────────────────────┘
Backend calls: updateBalance()
  - Current balance: 5,000,000 credits
  - Deduct: 12.5 + 120 = 132.5 credits
  - New balance: 4,999,867.5 credits
  - Saves to database ✅

┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Return response to user                            │
└─────────────────────────────────────────────────────────────┘
Frontend displays: "I'm doing well, thank you! How can I help?"
```

---

## 🎨 Visual Example: User's Balance Over Time

```
Initial balance: 10,000,000 credits ($10.00 USD)

Request 1: "Hello" → GPT-4o
  Prompt: 5 tokens × 2.5 = 12.5 credits
  Completion: 12 tokens × 10 = 120 credits
  Total: 132.5 credits
  Balance: 9,999,867.5 credits

Request 2: "Write a poem" → Claude-3-Opus
  Prompt: 8 tokens × 15 = 120 credits
  Completion: 150 tokens × 75 = 11,250 credits
  Total: 11,370 credits
  Balance: 9,988,497.5 credits

Request 3: "Summarize this article" → Gemini-1.5-Flash
  Prompt: 500 tokens × 0.15 = 75 credits
  Completion: 200 tokens × 0.6 = 120 credits
  Total: 195 credits
  Balance: 9,988,302.5 credits

Remaining: $9.988 USD
```

---

## 🔧 How Balance is Created

### When a New User Registers

**File:** `packages/data-schemas/src/methods/user.ts`

```javascript
async function createUser(data, balanceConfig, disableTTL, returnUser) {
  // 1. Create the user
  const user = await User.create(userData);
  
  // 2. If balance is enabled, create balance record
  if (balanceConfig?.enabled && balanceConfig?.startBalance) {
    await Balance.findOneAndUpdate(
      { user: user._id },
      {
        $inc: { tokenCredits: balanceConfig.startBalance },
        $set: {
          autoRefillEnabled: balanceConfig.autoRefillEnabled || false,
          refillIntervalValue: balanceConfig.refillIntervalValue,
          refillIntervalUnit: balanceConfig.refillIntervalUnit,
          refillAmount: balanceConfig.refillAmount,
        }
      },
      { upsert: true, new: true }
    );
  }
  
  return user._id;
}
```

**Configuration (from .env or librechat.yaml):**
```yaml
balance:
  enabled: true
  startBalance: 10000000  # Give new users $10 worth of credits
```

**Flow:**
```
User registers via UI
  ↓
POST /api/auth/register
  ↓
AuthService.registerUser()
  ↓
createUser(userData, appConfig.balance)
  ↓
User document created ✅
  ↓
Balance document created with startBalance ✅
```

---

## ❓ Common Questions

### Q1: Why don't I see a balance in MongoDB after creating a user?

**Answer:** Balance is only created if:
1. `balance.enabled = true` in config
2. `balance.startBalance > 0` in config

**Check your config:**
```bash
# In .env or librechat.yaml
BALANCE_ENABLED=true
BALANCE_START_BALANCE=10000000
```

If these are not set, users won't have a balance document!

---

### Q2: Can I manually create a balance for a user?

**Yes!** Use MongoDB directly or create an admin API:

```javascript
// MongoDB shell
db.balances.insertOne({
  user: ObjectId("USER_ID_HERE"),
  tokenCredits: 10000000,  // $10 USD
  autoRefillEnabled: false
});
```

Or create an admin endpoint:
```javascript
// api/server/routes/admin.js
router.post('/admin/balance/add', requireJwtAuth, requireAdmin, async (req, res) => {
  const { userId, amount } = req.body;
  
  await Balance.findOneAndUpdate(
    { user: userId },
    { $inc: { tokenCredits: amount } },
    { upsert: true, new: true }
  );
  
  res.json({ success: true });
});
```

---

### Q3: What happens if a user runs out of credits?

**Answer:** The `checkBalance()` function will reject the request:

```javascript
// api/models/balanceMethods.js
const checkBalance = async ({ req, res, txData }) => {
  const { canSpend, balance, tokenCost } = await checkBalanceRecord(txData);
  
  if (!canSpend) {
    // Log violation and throw error
    await logViolation(req, res, ViolationTypes.TOKEN_BALANCE, {
      balance,
      tokenCost,
      promptTokens: txData.amount,
    });
    
    throw new Error(JSON.stringify({
      type: 'TOKEN_BALANCE',
      balance,
      tokenCost,
    }));
  }
  
  return true;
};
```

The frontend will show an error: **"Insufficient balance"**

---

### Q4: How do I give users a "plan" (e.g., €5/month)?

**Option 1: Auto-refill (Built-in)**
```javascript
// Set auto-refill when creating user
balanceConfig = {
  enabled: true,
  startBalance: 5000000,        // €5 initial
  autoRefillEnabled: true,
  refillAmount: 5000000,        // Add €5
  refillIntervalValue: 30,
  refillIntervalUnit: 'days'    // Every 30 days
};
```

**Option 2: Stripe Integration (aim2balance.ai approach)**
```javascript
// When user pays €5 via Stripe
stripe.webhooks.on('payment_succeeded', async (event) => {
  const { userId, amount } = event.data;
  
  // Convert EUR to credits (1 EUR = 1,000,000 credits)
  const credits = amount * 1_000_000;
  
  await Balance.findOneAndUpdate(
    { user: userId },
    { $inc: { tokenCredits: credits } },
    { upsert: true }
  );
});
```

---

### Q5: How do I track total spending per user?

**Query all transactions:**
```javascript
// Get total spent by user
const transactions = await Transaction.find({ 
  user: userId,
  tokenValue: { $lt: 0 }  // Only spending (negative values)
});

const totalSpent = transactions.reduce((sum, tx) => sum + Math.abs(tx.tokenValue), 0);
const totalUSD = totalSpent / 1_000_000;

console.log(`User spent: ${totalSpent} credits = $${totalUSD.toFixed(2)} USD`);
```

**Aggregate by model:**
```javascript
const spendingByModel = await Transaction.aggregate([
  { $match: { user: ObjectId(userId), tokenValue: { $lt: 0 } } },
  { $group: {
      _id: '$model',
      totalCredits: { $sum: { $abs: '$tokenValue' } },
      requestCount: { $sum: 1 }
  }},
  { $sort: { totalCredits: -1 } }
]);

// Result:
// [
//   { _id: 'gpt-4o', totalCredits: 50000, requestCount: 120 },
//   { _id: 'claude-3-opus', totalCredits: 30000, requestCount: 45 },
//   ...
// ]
```

---

## 🚀 aim2balance.ai Enhancements

The aim2balance.ai project will enhance this system with:

1. **EUR-based billing** (instead of abstract credits)
2. **Provider markup** (+15% margin)
3. **Rebalancing fee** (+2-3% for environmental restoration)
4. **Real-time EUR cost tracking** per transaction
5. **Environmental metrics** (kWh, L, CO₂, m² restored)

See [Gap 2: EUR Cost Tracking Analysis](./gap2_eur_cost_tracking_analysis.md) for details.

---

## 📚 Related Files

### Backend
- `packages/data-schemas/src/schema/balance.ts` - Balance schema
- `packages/data-schemas/src/schema/transaction.ts` - Transaction schema
- `api/models/Transaction.js` - Transaction creation logic
- `api/models/spendTokens.js` - Token spending logic
- `api/models/balanceMethods.js` - Balance checking
- `api/models/tx.js` - Pricing configuration

### Frontend
- `client/src/components/Balance/` - Balance UI components
- `client/src/data-provider/queries/balance.ts` - Balance queries

---

## 🎓 Summary

**Balance System in 3 Sentences:**
1. Each user has a **Balance** document with `tokenCredits` (their wallet)
2. Each AI request creates **Transaction** documents that deduct credits
3. Credits are calculated as: `tokens × rate` (where rate is USD per 1M tokens)

**Key Formula:**
```
tokenValue = rawAmount × rate
where:
  rawAmount = number of tokens (negative for spending)
  rate = USD per 1 million tokens
  tokenValue = cost in token credits (1M credits = $1 USD)
```

---

**Document Status:** Complete  
**Last Updated:** 2025-10-05  
**Author:** Cascade AI Assistant
