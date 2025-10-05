# EUR Cost Tracking Implementation - Complete Guide

**Date:** 2025-10-05  
**Status:** ✅ Implemented  
**Primary Currency:** EUR (Euro)  
**Display:** Both USD and EUR for transparency

---

## 📋 Executive Summary

This document provides a complete guide to the EUR-based cost tracking system implemented for aim2balance.ai. The system calculates costs in both USD (from provider pricing) and EUR (primary currency for billing), applies provider markup and rebalancing fees, and stores all data for transparency and reporting.

**Key Features:**
- ✅ Primary currency: EUR (1,000,000 credits = €1.00)
- ✅ Dual currency display: Show both USD and EUR in UI
- ✅ Provider markup: +15% (configurable)
- ✅ Rebalancing fee: +2.5% (configurable)
- ✅ Real-time exchange rates with 24h caching
- ✅ Provider and endpoint tracking
- ✅ Backward compatible with existing token credits system

---

## 🎯 Business Requirements

### Primary Goal
**Calculate all costs in EUR as the primary currency**, while displaying both USD and EUR to users for transparency.

### Cost Calculation Formula

```
1. Base USD Cost = (tokens / 1,000,000) × USD rate per 1M tokens
2. With Markup = Base USD Cost × (1 + 0.15)  // +15% provider margin
3. With Fees = With Markup × (1 + 0.025)     // +2.5% rebalancing fee
4. Final EUR Cost = With Fees × Exchange Rate
```

**Example:**
```
Tokens: 1,000
USD Rate: $2.50 per 1M tokens
Exchange Rate: 0.92 EUR per 1 USD

1. Base USD: (1,000 / 1,000,000) × $2.50 = $0.0025
2. With Markup: $0.0025 × 1.15 = $0.002875
3. With Fees: $0.002875 × 1.025 = $0.00294688
4. Final EUR: $0.00294688 × 0.92 = €0.00271113

User is charged: €0.00271113
Balance deducted: 2,711 credits (2,711.13 rounded)
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Provider (OpenAI/Google/etc.)          │
│  Returns: { promptTokens: 500, completionTokens: 500 }      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              spendTokens() - api/models/tx.js                │
│  Gets USD pricing: $2.50 per 1M tokens                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         createTransaction() - api/models/Transaction.js      │
│  Creates transaction with provider/model info                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│      calculateTokenValue() - api/models/Transaction.js       │
│  1. Calculates base USD cost                                 │
│  2. Calls PricingService.calculateCost()                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         PricingService - api/server/services/               │
│  1. Fetches USD/EUR exchange rate (cached 24h)              │
│  2. Applies provider markup (+15%)                           │
│  3. Applies rebalancing fee (+2.5%)                          │
│  4. Converts to EUR                                          │
│  Returns: { costUSD, costEUR, exchangeRate, ... }            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Transaction saved to MongoDB                    │
│  Fields: costUSD, costEUR, exchangeRate, provider, etc.      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              updateBalance() - Deduct EUR credits            │
│  tokenCredits -= (costEUR × 1,000,000)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Files Modified/Created

### 1. Transaction Schema
**File:** `packages/data-schemas/src/schema/transaction.ts`

**Added Fields:**
```typescript
export interface ITransaction extends Document {
  // ... existing fields ...
  
  // aim2balance.ai: EUR Cost Tracking
  costUSD?: number;        // Base cost in USD (from provider pricing)
  costEUR?: number;        // Final cost in EUR (primary currency)
  exchangeRate?: number;   // USD to EUR exchange rate used
  providerMarkup?: number; // Markup percentage (e.g., 0.15 for 15%)
  rebalancingFee?: number; // Environmental fee (e.g., 0.025 for 2.5%)
  
  // aim2balance.ai: Provider & Performance Tracking
  provider?: string;       // AI provider: 'openai', 'anthropic', 'google'
  endpoint?: string;       // API endpoint used
  durationMs?: number;     // Request duration in milliseconds
}
```

**Database Indexes:**
- `costEUR` - Indexed for reporting queries
- `provider` - Indexed for provider-based analytics

---

### 2. PricingService (NEW)
**File:** `api/server/services/PricingService.js`

**Purpose:** Centralized EUR pricing calculations

**Key Methods:**

#### `getExchangeRate()`
Fetches USD to EUR exchange rate from exchangerate-api.com
- Caches for 24 hours
- Falls back to hardcoded rate (0.92) if API unavailable
- Free tier: 1,500 requests/month

```javascript
const rate = await PricingService.getExchangeRate();
// Returns: 0.92 (EUR per 1 USD)
```

#### `calculateCost({ tokens, rateUSD, provider, model })`
Calculates EUR cost with markup and fees

```javascript
const costDetails = await PricingService.calculateCost({
  tokens: 1000,
  rateUSD: 2.50,
  provider: 'openai',
  model: 'gpt-4o',
});

// Returns:
// {
//   costUSD: 0.0025,
//   costEUR: 0.00271113,
//   exchangeRate: 0.92,
//   providerMarkup: 0.15,
//   rebalancingFee: 0.025
// }
```

#### `eurToTokenCredits(costEUR)`
Converts EUR to token credits (1M credits = €1)

```javascript
const credits = PricingService.eurToTokenCredits(0.00271113);
// Returns: 2711.13
```

---

### 3. Transaction Creation Logic
**File:** `api/models/Transaction.js`

**Modified:** `calculateTokenValue()` - Now async

**Changes:**
1. Made function async to call PricingService
2. Calculates both USD and EUR costs
3. Updates tokenValue to use EUR (1M credits = €1)
4. Stores all cost details in transaction

```javascript
async function calculateTokenValue(txn) {
  // ... existing USD calculation ...
  
  // NEW: Calculate EUR cost
  if (txn.rawAmount && txn.rate) {
    const costDetails = await PricingService.calculateCost({
      tokens: Math.abs(txn.rawAmount),
      rateUSD: txn.rate,
      provider: txn.provider,
      model: txn.model,
    });
    
    txn.costUSD = costDetails.costUSD;
    txn.costEUR = costDetails.costEUR;
    txn.exchangeRate = costDetails.exchangeRate;
    txn.providerMarkup = costDetails.providerMarkup;
    txn.rebalancingFee = costDetails.rebalancingFee;
    
    // Update tokenValue to EUR-based credits
    txn.tokenValue = PricingService.eurToTokenCredits(costDetails.costEUR) 
      * Math.sign(txn.rawAmount);
  }
}
```

**Updated Functions:**
- `createTransaction()` - Now awaits `calculateTokenValue()`
- `createAutoRefillTransaction()` - Now awaits `calculateTokenValue()`

---

### 4. Balance Schema
**File:** `packages/data-schemas/src/schema/balance.ts`

**Updated Comment:**
```typescript
// aim2balance.ai: Primary currency is EUR
// 1000 tokenCredits = €0.001 EUR (changed from USD)
// We keep tokenCredits for backward compatibility but it now represents EUR
tokenCredits: {
  type: Number,
  default: 0,
}
```

**No schema changes needed** - tokenCredits now represents EUR instead of USD.

---

### 5. Environment Configuration
**File:** `.env.example`

**Added Variables:**
```bash
#==================================================#
#          aim2balance.ai: EUR Pricing            #
#==================================================#
# Primary currency is EUR. We calculate both USD and EUR for transparency.
# Provider markup: Additional margin on top of provider costs (default: 15%)
PROVIDER_MARKUP=0.15
# Rebalancing fee: Environmental contribution for Bergwaldprojekt (default: 2.5%)
REBALANCING_FEE=0.025
# Fallback EUR exchange rate if API unavailable (EUR per 1 USD)
FALLBACK_EUR_RATE=0.92
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROVIDER_MARKUP` | `0.15` | Provider margin (15%) |
| `REBALANCING_FEE` | `0.025` | Environmental fee (2.5%) |
| `FALLBACK_EUR_RATE` | `0.92` | Fallback exchange rate (EUR per 1 USD) |

### Adjusting Markup and Fees

**To change provider markup to 20%:**
```bash
PROVIDER_MARKUP=0.20
```

**To change rebalancing fee to 3%:**
```bash
REBALANCING_FEE=0.03
```

**To manually set exchange rate:**
```javascript
// In code (for testing)
const PricingService = require('~/server/services/PricingService');
PricingService.setExchangeRate(0.95);
```

---

## 📊 Database Schema

### Transaction Document Example

```javascript
{
  _id: ObjectId("..."),
  user: ObjectId("..."),
  conversationId: "abc123",
  tokenType: "completion",
  model: "gpt-4o",
  
  // Token tracking
  rawAmount: -1000,
  rate: 2.50,
  tokenValue: -2711.13,  // EUR-based credits
  
  // aim2balance.ai: EUR Cost Tracking
  costUSD: 0.0025,
  costEUR: 0.00271113,
  exchangeRate: 0.92,
  providerMarkup: 0.15,
  rebalancingFee: 0.025,
  
  // aim2balance.ai: Provider Tracking
  provider: "openai",
  endpoint: "chat/completions",
  durationMs: 1250,
  
  createdAt: ISODate("2025-10-05T10:00:00Z"),
  updatedAt: ISODate("2025-10-05T10:00:00Z")
}
```

### Balance Document Example

```javascript
{
  _id: ObjectId("..."),
  user: ObjectId("..."),
  tokenCredits: 10000000,  // €10.00 EUR (changed from USD)
  autoRefillEnabled: true,
  refillIntervalValue: 30,
  refillIntervalUnit: "days",
  refillAmount: 5000000,   // €5.00 EUR
  lastRefill: ISODate("2025-10-05T00:00:00Z")
}
```

---

## 🧪 Testing

### Test Case 1: Verify EUR Calculation

**Setup:**
```bash
# .env
PROVIDER_MARKUP=0.15
REBALANCING_FEE=0.025
FALLBACK_EUR_RATE=0.92
```

**Test:**
```javascript
const PricingService = require('~/server/services/PricingService');

const result = await PricingService.calculateCost({
  tokens: 1000,
  rateUSD: 2.50,
  provider: 'openai',
  model: 'gpt-4o',
});

console.log(result);
```

**Expected Output:**
```javascript
{
  costUSD: 0.0025,
  costEUR: 0.00271113,  // Approximately
  exchangeRate: 0.92,
  providerMarkup: 0.15,
  rebalancingFee: 0.025
}
```

---

### Test Case 2: Verify Transaction Creation

**Test:**
```javascript
const { createTransaction } = require('~/api/models/Transaction');

const result = await createTransaction({
  user: userId,
  conversationId: 'test123',
  tokenType: 'completion',
  model: 'gpt-4o',
  provider: 'openai',
  rawAmount: -1000,
  valueKey: 'gpt-4o',
  balance: { enabled: true },
  transactions: { enabled: true },
});

console.log(result);
```

**Expected:**
- Transaction saved with `costUSD` and `costEUR`
- Balance deducted by EUR-based credits
- Exchange rate stored

---

### Test Case 3: Verify Exchange Rate Caching

**Test:**
```javascript
const PricingService = require('~/server/services/PricingService');

// First call - fetches from API
const rate1 = await PricingService.getExchangeRate();
console.log('First call:', rate1);

// Second call - uses cache
const rate2 = await PricingService.getExchangeRate();
console.log('Second call (cached):', rate2);

// Check config
console.log(PricingService.getConfig());
```

**Expected:**
- First call fetches from API
- Second call returns cached value
- Config shows lastFetch timestamp

---

## 📈 Reporting Queries

### Total EUR Spent by User

```javascript
const transactions = await Transaction.aggregate([
  { $match: { user: ObjectId(userId) } },
  { $group: {
    _id: null,
    totalEUR: { $sum: '$costEUR' },
    totalUSD: { $sum: '$costUSD' },
    count: { $sum: 1 }
  }}
]);
```

### Spending by Provider

```javascript
const byProvider = await Transaction.aggregate([
  { $match: { costEUR: { $exists: true } } },
  { $group: {
    _id: '$provider',
    totalEUR: { $sum: '$costEUR' },
    totalUSD: { $sum: '$costUSD' },
    requests: { $sum: 1 }
  }},
  { $sort: { totalEUR: -1 } }
]);
```

### Monthly Rebalancing Fee

```javascript
const startOfMonth = new Date('2025-10-01');
const endOfMonth = new Date('2025-11-01');

const rebalancingTotal = await Transaction.aggregate([
  { $match: {
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    costEUR: { $exists: true }
  }},
  { $group: {
    _id: null,
    totalCostEUR: { $sum: '$costEUR' },
    totalCostUSD: { $sum: '$costUSD' }
  }},
  { $project: {
    totalCostEUR: 1,
    totalCostUSD: 1,
    rebalancingFeeEUR: { $multiply: ['$totalCostEUR', 0.025 / 1.025] },
    rebalancingFeeUSD: { $multiply: ['$totalCostUSD', 0.025 / 1.025] }
  }}
]);
```

---

## 🎨 UI Display (Future Implementation)

### Balance Display Component

```tsx
// Example component structure
interface BalanceDisplayProps {
  tokenCredits: number;
  exchangeRate: number;
}

function BalanceDisplay({ tokenCredits, exchangeRate }: BalanceDisplayProps) {
  const balanceEUR = tokenCredits / 1_000_000;
  const balanceUSD = balanceEUR / exchangeRate;
  
  return (
    <div>
      <div className="primary">€{balanceEUR.toFixed(2)} EUR</div>
      <div className="secondary">${balanceUSD.toFixed(2)} USD</div>
    </div>
  );
}
```

### Transaction History Display

```tsx
interface TransactionItemProps {
  transaction: {
    costEUR: number;
    costUSD: number;
    model: string;
    provider: string;
    createdAt: Date;
  };
}

function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="transaction-item">
      <div className="model">{transaction.model}</div>
      <div className="provider">{transaction.provider}</div>
      <div className="cost">
        <span className="primary">€{transaction.costEUR.toFixed(4)}</span>
        <span className="secondary">${transaction.costUSD.toFixed(4)}</span>
      </div>
      <div className="date">{transaction.createdAt.toLocaleDateString()}</div>
    </div>
  );
}
```

---

## 🔄 Migration Guide

### For Existing Deployments

**Step 1: Update Code**
```bash
git pull origin main
npm install
```

**Step 2: Add Environment Variables**
```bash
# Add to .env
PROVIDER_MARKUP=0.15
REBALANCING_FEE=0.025
FALLBACK_EUR_RATE=0.92
```

**Step 3: Restart Application**
```bash
# Docker
docker-compose restart

# npm
npm run backend
```

**Step 4: Verify**
- Check logs for `[PricingService] Initialized`
- Create a test transaction
- Verify `costEUR` and `costUSD` are populated

**Note:** Existing transactions without EUR data will continue to work. New transactions will have EUR data.

---

## 🚨 Troubleshooting

### Issue: Exchange Rate API Failing

**Symptoms:**
- Logs show: `Failed to fetch exchange rate, using fallback`

**Solution:**
1. Check internet connectivity
2. Verify API is accessible: `curl https://api.exchangerate-api.com/v4/latest/USD`
3. Adjust fallback rate if needed: `FALLBACK_EUR_RATE=0.95`

---

### Issue: Transactions Missing EUR Data

**Symptoms:**
- `costEUR` is undefined in transactions

**Solution:**
1. Check PricingService is loaded: `grep "PricingService" api/models/Transaction.js`
2. Verify `calculateTokenValue` is async
3. Check logs for errors during cost calculation

---

### Issue: Balance Deduction Incorrect

**Symptoms:**
- Balance deducted by wrong amount

**Solution:**
1. Verify `tokenValue` calculation in `calculateTokenValue()`
2. Check `eurToTokenCredits()` conversion: 1M credits = €1
3. Review transaction logs for cost details

---

## 📚 API Reference

### PricingService

#### `getExchangeRate(): Promise<number>`
Returns current USD to EUR exchange rate (cached 24h)

#### `calculateCost(params): Promise<CostDetails>`
Calculates EUR cost with markup and fees

**Parameters:**
- `tokens: number` - Number of tokens used
- `rateUSD: number` - USD rate per 1M tokens
- `provider?: string` - AI provider name
- `model?: string` - Model name

**Returns:**
```typescript
{
  costUSD: number;
  costEUR: number;
  exchangeRate: number;
  providerMarkup: number;
  rebalancingFee: number;
}
```

#### `eurToTokenCredits(costEUR: number): number`
Converts EUR to token credits (1M credits = €1)

#### `tokenCreditsToEur(credits: number): number`
Converts token credits to EUR

#### `setExchangeRate(rate: number): void`
Manually set exchange rate (for testing)

#### `getConfig(): object`
Returns current pricing configuration

---

## 🎯 Summary

### What Was Implemented

1. ✅ **Transaction Schema Extended**
   - Added EUR/USD cost fields
   - Added provider/endpoint tracking
   - Added performance metrics (durationMs)

2. ✅ **PricingService Created**
   - Real-time exchange rate fetching
   - Provider markup calculation (+15%)
   - Rebalancing fee calculation (+2.5%)
   - EUR conversion logic

3. ✅ **Balance System Updated**
   - tokenCredits now represents EUR (1M = €1)
   - Backward compatible with existing system

4. ✅ **Transaction Creation Modified**
   - Async cost calculation
   - Both USD and EUR stored
   - Exchange rate recorded

5. ✅ **Configuration Added**
   - Environment variables for markup/fees
   - Fallback exchange rate
   - Configurable pricing

### What's Next (UI Implementation)

1. ⏳ **Balance Display Component**
   - Show EUR as primary
   - Show USD as secondary
   - Real-time conversion

2. ⏳ **Transaction History**
   - Display both currencies
   - Show provider/model
   - Cost breakdown

3. ⏳ **Pricing Page**
   - Explain markup and fees
   - Show current exchange rate
   - Cost calculator

---

**Document Status:** Complete  
**Last Updated:** 2025-10-05  
**Author:** Cascade AI Assistant  
**Implementation Status:** ✅ Backend Complete | ⏳ UI Pending

**Related Documentation:**
- [Gap 2: EUR Cost Tracking Analysis](./gap2_eur_cost_tracking_analysis.md)
- [Configuration Guide](./configuration_guide.md)
- [Balance & Credits System](./balance_credits_explained.md)
