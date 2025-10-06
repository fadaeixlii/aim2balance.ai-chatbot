# Gap 2: EUR Cost Tracking - Comprehensive Analysis & Implementation Plan

**Document Version:** 1.0  
**Date:** 2025-10-05  
**Status:** Analysis Complete - Ready for Implementation

---

## 📋 Executive Summary

This document provides a comprehensive analysis of **Gap 2: EUR Cost Tracking** for the aim2balance.ai project. It examines the current LibreChat token tracking implementation, identifies missing components for EUR-based billing, and provides a detailed implementation roadmap.

**Key Findings:**
- ✅ Current system tracks tokens accurately
- ✅ USD pricing is comprehensive and well-maintained
- ❌ No EUR cost calculation or storage
- ❌ No provider markup (+15%) or rebalancing fee (+2-3%)
- ❌ Missing provider/endpoint tracking

**Effort Estimate:** 10 hours (Medium complexity)

---

## 🎯 Project Context

### aim2balance.ai Mission
Create an EU-hosted multi-model AI chat platform that:
1. Tracks environmental footprint (tokens → energy/water → CO₂ → m² restored)
2. Implements **transparent EUR-based billing** with prepaid credit wallet
3. Applies provider markup (+15%) and rebalancing fee (+2-3%)
4. Automatically calculates monthly donations to Bergwaldprojekt

### Target Data Model
```typescript
Transaction {
  userId: ObjectId,
  model: string,
  provider: string,        // NEW: 'openai', 'anthropic', etc.
  tokens_in: number,
  tokens_out: number,
  costEUR: number,         // NEW: Final EUR cost
  costUSD: number,         // NEW: Base USD cost
  exchangeRate: number,    // NEW: USD/EUR rate used
  kWh: number,            // Future: energy consumption
  L: number,              // Future: water consumption
  CO₂e: number,           // Future: carbon emissions
  m²: number              // Future: ecosystem restored
}
```

---

## 🔍 Current Implementation Analysis

### 1. Balance Schema
**File:** `packages/data-schemas/src/schema/balance.ts`

```typescript
{
  user: ObjectId,
  tokenCredits: Number,        // 1000 credits = $0.001 USD
  autoRefillEnabled: Boolean,
  refillIntervalValue: Number,
  refillIntervalUnit: String,  // 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  lastRefill: Date,
  refillAmount: Number
}
```

**✅ Strengths:**
- Auto-refill system for continuous service
- Flexible interval configuration
- Optimistic concurrency control in updates

**❌ Limitations:**
- Abstract "token credits" instead of EUR balance
- No separation of wallet balance vs. usage tracking

---

### 2. Transaction Schema
**File:** `packages/data-schemas/src/schema/transaction.ts`

```typescript
{
  user: ObjectId,
  conversationId?: string,
  tokenType: 'prompt' | 'completion' | 'credits',
  model?: string,
  context?: string,
  valueKey?: string,
  rate?: number,           // Multiplier used (USD per 1M tokens)
  rawAmount?: number,      // Raw token count
  tokenValue?: number,     // Calculated cost in token credits
  inputTokens?: number,    // For structured tokens
  writeTokens?: number,    // For cache writes
  readTokens?: number,     // For cache reads
  createdAt: Date,
  updatedAt: Date
}
```

**✅ Strengths:**
- Comprehensive token tracking (prompt/completion/cache)
- Supports structured tokens (Anthropic prompt caching)
- Timestamps for auditing

**❌ Missing for Gap 2:**
- `costEUR` - Final EUR cost
- `costUSD` - Base USD cost
- `exchangeRate` - Conversion rate used
- `providerMarkup` - Markup percentage applied
- `rebalancingFee` - Environmental fee percentage
- `provider` - AI provider name
- `endpoint` - API endpoint used
- `durationMs` - Request duration

---

### 3. Token Pricing Logic
**File:** `api/models/tx.js`

**Current Implementation:**
```javascript
const tokenValues = {
  'gpt-4o': { prompt: 2.5, completion: 10 },      // $2.5/$10 per 1M tokens
  'claude-3-opus': { prompt: 15, completion: 75 },
  'gemini-1.5-flash': { prompt: 0.15, completion: 0.6 },
  'grok-3': { prompt: 3.0, completion: 15.0 },
  // ... 100+ model configurations
};

const getMultiplier = ({ valueKey, tokenType, model, endpoint }) => {
  // Returns USD rate per 1M tokens
  return tokenValues[valueKey]?.[tokenType] ?? defaultRate;
};
```

**How Cost Calculation Works:**
1. `getValueKey(model, endpoint)` → matches model name to pricing key
2. `getMultiplier({valueKey, tokenType})` → returns USD rate per 1M tokens
3. `calculateTokenValue(txn)` → `tokenValue = rawAmount * multiplier`
4. Result stored as abstract token credits (1000 credits = $0.001 USD)

**✅ Strengths:**
- Comprehensive model coverage (OpenAI, Anthropic, Google, Grok, Mistral, etc.)
- Supports cache pricing (Anthropic prompt caching)
- Configurable via `endpointTokenConfig`
- Well-maintained pricing data

**❌ Limitations:**
- No EUR conversion
- No provider markup calculation (+15%)
- No rebalancing fee (+2-3%)
- Static pricing (hardcoded in file)

---

### 4. Transaction Creation Flow
**File:** `api/models/Transaction.js`

```javascript
async function createTransaction(txData) {
  const transaction = new Transaction(txData);
  calculateTokenValue(transaction);  // Sets rate & tokenValue
  await transaction.save();
  
  if (balance?.enabled) {
    await updateBalance({
      user: transaction.user,
      incrementValue: transaction.tokenValue  // Negative value
    });
  }
}
```

**Flow Diagram:**
```
AI Client (OpenAI/Anthropic/Google)
  ↓
recordTokenUsage({ promptTokens, completionTokens })
  ↓
spendTokens(txData, tokenUsage)
  ↓
createTransaction({ tokenType: 'prompt', rawAmount: -tokens })
  ↓
calculateTokenValue(txn)  // txn.tokenValue = rawAmount * multiplier
  ↓
transaction.save()
  ↓
updateBalance({ incrementValue: tokenValue })  // Deduct from balance
```

**✅ Verified:** Process is robust and well-tested
**❌ Missing:** No EUR cost calculation or storage

---

### 5. AI Client Integration
**File:** `api/app/clients/OpenAIClient.js`

```javascript
async recordTokenUsage({ promptTokens, completionTokens, usage, context = 'message' }) {
  await spendTokens(
    {
      context,
      model: this.modelOptions.model,
      conversationId: this.conversationId,
      user: this.user ?? this.options.req.user?.id,
      endpointTokenConfig: this.options.endpointTokenConfig,
    },
    { promptTokens, completionTokens },
  );
}
```

**✅ Verified:** Token usage properly captured from AI provider responses
**❌ Missing:** No provider name, endpoint, or duration tracking

---

## ❌ Gap Analysis: What's Missing

### Gap 2.1: No EUR Cost Storage
**Current:** Only `tokenValue` (abstract credits)  
**Needed:** `costEUR` field in Transaction model

### Gap 2.2: No USD → EUR Conversion
**Current:** Rates are in USD per 1M tokens, but no conversion to EUR  
**Needed:**
- Real-time or cached USD/EUR exchange rate
- Conversion logic: `costUSD = (tokens / 1,000,000) * rateUSD` → `costEUR = costUSD * exchangeRate`

### Gap 2.3: No Provider Markup
**Current:** Raw provider pricing only  
**Needed:** +15% margin calculation
- Example: If OpenAI charges $0.025, bill user €0.025 * 1.15 * exchangeRate

### Gap 2.4: No Rebalancing Fee
**Current:** No environmental fee  
**Needed:** +2-3% fee for Bergwaldprojekt donations
- Should be configurable (2%, 2.5%, or 3%)

### Gap 2.5: No Provider/Endpoint Tracking
**Current:** Only `model` field  
**Needed:**
- `provider`: 'openai' | 'anthropic' | 'google' | 'groq' | etc.
- `endpoint`: 'chat/completions' | 'messages' | etc.

### Gap 2.6: Static Pricing Configuration
**Current:** Hardcoded in `tx.js`  
**Needed:**
- Database-backed pricing table for dynamic updates
- Or config file with hot-reload capability

---

## 🛠️ Implementation Plan

### Phase 1: Extend Transaction Schema (1 hour)

**File:** `packages/data-schemas/src/schema/transaction.ts`

**Add fields:**
```typescript
export interface ITransaction extends Document {
  // ... existing fields ...
  
  // NEW: EUR Cost Tracking
  costUSD?: number;        // Cost in USD before conversion
  costEUR?: number;        // Final cost in EUR (with markup + fees)
  exchangeRate?: number;   // USD/EUR rate used for conversion
  providerMarkup?: number; // Markup percentage applied (e.g., 0.15 for 15%)
  rebalancingFee?: number; // Rebalancing fee percentage (e.g., 0.025 for 2.5%)
  
  // NEW: Provider/Endpoint Tracking
  provider?: string;       // 'openai', 'anthropic', 'google', etc.
  endpoint?: string;       // 'chat/completions', 'messages', etc.
  durationMs?: number;     // Request duration in milliseconds
}
```

**Schema update:**
```typescript
const transactionSchema: Schema<ITransaction> = new Schema(
  {
    // ... existing fields ...
    costUSD: { type: Number },
    costEUR: { type: Number, index: true },
    exchangeRate: { type: Number },
    providerMarkup: { type: Number },
    rebalancingFee: { type: Number },
    provider: { type: String, index: true },
    endpoint: { type: String },
    durationMs: { type: Number },
  },
  { timestamps: true }
);
```

---

### Phase 2: Create PricingService.js (3 hours)

**File:** `api/services/PricingService.js` (NEW)

**Responsibilities:**
1. Fetch USD/EUR exchange rate (cached, updated daily)
2. Calculate USD cost from tokens
3. Apply provider markup (+15%)
4. Apply rebalancing fee (+2-3%)
5. Convert to EUR

**Implementation:**
```javascript
const { logger } = require('@librechat/data-schemas');

class PricingService {
  constructor() {
    this.exchangeRate = null;
    this.lastFetch = null;
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    this.PROVIDER_MARKUP = parseFloat(process.env.PROVIDER_MARKUP || '0.15'); // 15%
    this.REBALANCING_FEE = parseFloat(process.env.REBALANCING_FEE || '0.025'); // 2.5%
    this.FALLBACK_RATE = 1.10; // Fallback USD/EUR rate
  }

  /**
   * Fetches the current USD/EUR exchange rate from ECB API
   * @returns {Promise<number>} Exchange rate (EUR per 1 USD)
   */
  async getExchangeRate() {
    // Check cache
    if (this.exchangeRate && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.exchangeRate;
    }
    
    try {
      // Fetch from European Central Bank API
      const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR');
      const data = await response.json();
      
      if (data.success && data.rates?.EUR) {
        this.exchangeRate = data.rates.EUR;
        this.lastFetch = Date.now();
        logger.info(`[PricingService] Exchange rate updated: 1 USD = ${this.exchangeRate} EUR`);
        return this.exchangeRate;
      }
      
      throw new Error('Invalid API response');
    } catch (error) {
      logger.warn(`[PricingService] Failed to fetch exchange rate, using fallback: ${error.message}`);
      this.exchangeRate = this.FALLBACK_RATE;
      this.lastFetch = Date.now();
      return this.exchangeRate;
    }
  }

  /**
   * Calculates the EUR cost for a given token usage
   * @param {Object} params
   * @param {number} params.tokens - Number of tokens used
   * @param {number} params.rateUSD - USD rate per 1M tokens
   * @param {string} params.provider - AI provider name
   * @param {string} params.model - Model name
   * @returns {Promise<Object>} Cost details
   */
  async calculateCost({ tokens, rateUSD, provider, model }) {
    // 1. Calculate base USD cost
    const costUSD = (tokens / 1_000_000) * rateUSD;
    
    // 2. Get exchange rate
    const exchangeRate = await this.getExchangeRate();
    
    // 3. Apply markup
    const costWithMarkup = costUSD * (1 + this.PROVIDER_MARKUP);
    
    // 4. Apply rebalancing fee
    const costWithFees = costWithMarkup * (1 + this.REBALANCING_FEE);
    
    // 5. Convert to EUR
    const costEUR = costWithFees * exchangeRate;
    
    logger.debug('[PricingService] Cost calculation:', {
      tokens,
      rateUSD,
      costUSD: costUSD.toFixed(6),
      markup: this.PROVIDER_MARKUP,
      rebalancingFee: this.REBALANCING_FEE,
      exchangeRate,
      costEUR: costEUR.toFixed(6),
      provider,
      model,
    });
    
    return {
      costUSD,
      costEUR,
      exchangeRate,
      providerMarkup: this.PROVIDER_MARKUP,
      rebalancingFee: this.REBALANCING_FEE,
    };
  }
}

module.exports = new PricingService();
```

**Exchange Rate Options:**
1. **exchangerate.host** - Free API with ECB data
2. **ECB API** - European Central Bank (official rates)
3. **Fallback** - Hardcoded rate (1.10) if API unavailable
4. **Cache** - 24h TTL to minimize API calls

---

### Phase 3: Update Transaction.js (2 hours)

**File:** `api/models/Transaction.js`

**Modify `calculateTokenValue()` function:**
```javascript
const PricingService = require('~/services/PricingService');

async function calculateTokenValue(txn) {
  if (!txn.valueKey || !txn.tokenType) {
    txn.tokenValue = txn.rawAmount;
  }
  
  const { valueKey, tokenType, model, endpointTokenConfig } = txn;
  const multiplier = Math.abs(getMultiplier({ valueKey, tokenType, model, endpointTokenConfig }));
  txn.rate = multiplier;
  txn.tokenValue = txn.rawAmount * multiplier;
  
  if (txn.context && txn.tokenType === 'completion' && txn.context === 'incomplete') {
    txn.tokenValue = Math.ceil(txn.tokenValue * cancelRate);
    txn.rate *= cancelRate;
  }
  
  // NEW: Calculate EUR cost
  if (txn.rawAmount && txn.rate) {
    const tokens = Math.abs(txn.rawAmount);
    const rateUSD = txn.rate; // Rate is already in USD per 1M tokens
    
    try {
      const costDetails = await PricingService.calculateCost({
        tokens,
        rateUSD,
        provider: txn.provider,
        model: txn.model,
      });
      
      txn.costUSD = costDetails.costUSD;
      txn.costEUR = costDetails.costEUR;
      txn.exchangeRate = costDetails.exchangeRate;
      txn.providerMarkup = costDetails.providerMarkup;
      txn.rebalancingFee = costDetails.rebalancingFee;
    } catch (error) {
      logger.error('[calculateTokenValue] Failed to calculate EUR cost:', error);
      // Continue without EUR cost if calculation fails
    }
  }
}
```

**Update `createTransaction()` to be async-aware:**
```javascript
async function createTransaction(_txData) {
  const { balance, transactions, ...txData } = _txData;
  if (txData.rawAmount != null && isNaN(txData.rawAmount)) {
    return;
  }

  if (transactions?.enabled === false) {
    return;
  }

  const transaction = new Transaction(txData);
  transaction.endpointTokenConfig = txData.endpointTokenConfig;
  
  // calculateTokenValue is now async
  await calculateTokenValue(transaction);

  await transaction.save();
  
  if (!balance?.enabled) {
    return;
  }

  let incrementValue = transaction.tokenValue;
  const balanceResponse = await updateBalance({
    user: transaction.user,
    incrementValue,
  });

  return {
    rate: transaction.rate,
    user: transaction.user.toString(),
    balance: balanceResponse.tokenCredits,
    costEUR: transaction.costEUR, // NEW: Include EUR cost in response
    [transaction.tokenType]: incrementValue,
  };
}
```

---

### Phase 4: Update spendTokens.js (1 hour)

**File:** `api/models/spendTokens.js`

**Add provider/endpoint to transaction data:**
```javascript
const spendTokens = async (txData, tokenUsage) => {
  const { promptTokens, completionTokens } = tokenUsage;
  
  // Extract provider/endpoint from txData (passed from AI client)
  const { provider, endpoint, durationMs } = txData;
  
  logger.debug(
    `[spendTokens] conversationId: ${txData.conversationId}${
      txData?.context ? ` | Context: ${txData?.context}` : ''
    } | Provider: ${provider} | Token usage: `,
    { promptTokens, completionTokens },
  );
  
  let prompt, completion;
  try {
    if (promptTokens !== undefined) {
      prompt = await createTransaction({
        ...txData,
        provider,
        endpoint,
        durationMs,
        tokenType: 'prompt',
        rawAmount: promptTokens === 0 ? 0 : -Math.max(promptTokens, 0),
      });
    }

    if (completionTokens !== undefined) {
      completion = await createTransaction({
        ...txData,
        provider,
        endpoint,
        durationMs,
        tokenType: 'completion',
        rawAmount: completionTokens === 0 ? 0 : -Math.max(completionTokens, 0),
      });
    }

    if (prompt || completion) {
      logger.debug('[spendTokens] Transaction data record against balance:', {
        user: txData.user,
        provider,
        prompt: prompt?.prompt,
        promptRate: prompt?.rate,
        promptCostEUR: prompt?.costEUR,
        completion: completion?.completion,
        completionRate: completion?.rate,
        completionCostEUR: completion?.costEUR,
        balance: completion?.balance ?? prompt?.balance,
      });
    } else {
      logger.debug('[spendTokens] No transactions incurred against balance');
    }
  } catch (err) {
    logger.error('[spendTokens]', err);
  }
};
```

---

### Phase 5: Update AI Clients (2 hours)

**Files to update:**
- `api/app/clients/OpenAIClient.js`
- `api/app/clients/AnthropicClient.js`
- `api/app/clients/GoogleClient.js`
- `api/app/clients/OllamaClient.js`

**Example: OpenAIClient.js**
```javascript
class OpenAIClient {
  constructor(options) {
    // ... existing code ...
    this.requestStartTime = null;
  }

  async sendCompletion(payload, opts = {}) {
    this.requestStartTime = Date.now(); // Track request start
    // ... existing code ...
  }

  async recordTokenUsage({ promptTokens, completionTokens, usage, context = 'message' }) {
    const durationMs = this.requestStartTime ? Date.now() - this.requestStartTime : null;
    
    await spendTokens(
      {
        context,
        model: this.modelOptions.model,
        conversationId: this.conversationId,
        user: this.user ?? this.options.req.user?.id,
        endpointTokenConfig: this.options.endpointTokenConfig,
        
        // NEW: Add provider/endpoint/duration
        provider: 'openai',
        endpoint: 'chat/completions',
        durationMs,
      },
      { promptTokens, completionTokens },
    );
  }
}
```

**Provider Mapping:**
| Client | Provider Value |
|--------|---------------|
| OpenAIClient | `'openai'` |
| AnthropicClient | `'anthropic'` |
| GoogleClient | `'google'` |
| OllamaClient | `'ollama'` |
| GroqClient | `'groq'` |

---

### Phase 6: Database Migration (1 hour)

**File:** `api/db/migrations/add-eur-cost-fields.js` (NEW)

```javascript
const mongoose = require('mongoose');
const { logger } = require('@librechat/data-schemas');

async function migrate() {
  try {
    const db = mongoose.connection.db;
    
    // Add indexes for new fields
    await db.collection('transactions').createIndex({ provider: 1 });
    await db.collection('transactions').createIndex({ costEUR: 1 });
    await db.collection('transactions').createIndex({ createdAt: -1, provider: 1 });
    
    logger.info('[Migration] EUR cost tracking indexes created successfully');
    
    // Optional: Backfill existing transactions with EUR cost
    // (Only if you want historical data to have EUR costs)
    // This is NOT recommended for MVP - only new transactions need EUR costs
    
  } catch (error) {
    logger.error('[Migration] Failed to add EUR cost tracking fields:', error);
    throw error;
  }
}

module.exports = { migrate };
```

---

## ⏱️ Effort Estimation

| Task | Estimated Time | Complexity |
|------|---------------|------------|
| Extend Transaction schema | 1h | Low |
| Create PricingService.js | 3h | Medium |
| Update Transaction.js | 2h | Medium |
| Update spendTokens.js | 1h | Low |
| Update AI Clients (4 files) | 2h | Low |
| Database migration | 1h | Low |
| **TOTAL** | **10h** | **Medium** |

---

## 🚨 Critical Decisions

### Decision 1: Exchange Rate Source
**Options:**
1. **exchangerate.host** - Free API with ECB data
2. **ECB API** - Free, official EU rates
3. **Hardcoded fallback** - 1.10 USD/EUR
4. **Manual config** - Admin updates rate in settings

**✅ Recommendation:** exchangerate.host with hardcoded fallback (1.10)

---

### Decision 2: Markup Configuration
**Options:**
1. **Hardcoded** in PricingService (15% + 2.5%)
2. **Environment variable** (.env file)
3. **Database setting** (admin configurable)

**✅ Recommendation:** Environment variable for MVP, database setting for production

**Example .env:**
```bash
PROVIDER_MARKUP=0.15        # 15% markup
REBALANCING_FEE=0.025       # 2.5% rebalancing fee
```

---

### Decision 3: Backward Compatibility
**Question:** Should existing transactions be backfilled with EUR costs?

**Options:**
1. **No backfill** - Only new transactions have EUR costs
2. **Backfill** - Run migration to calculate EUR for historical data

**✅ Recommendation:** No backfill for MVP (historical data not critical)

---

## 📊 Testing Strategy

### Unit Tests
1. **PricingService.calculateCost()** - Test markup/fee calculations
2. **PricingService.getExchangeRate()** - Test caching and fallback
3. **calculateTokenValue()** - Test EUR cost calculation
4. **createTransaction()** - Test EUR fields are saved

### Integration Tests
1. Full flow: AI request → token tracking → EUR cost → database
2. Test with different providers (OpenAI, Anthropic, Google)
3. Test exchange rate API failure (should use fallback)

### Manual Testing
1. Create test user with balance
2. Send chat messages to different models
3. Verify transactions have `costEUR`, `provider`, `exchangeRate`
4. Check MongoDB documents directly

---

## 🔗 Related Documentation

- [Task: Usage/Balance Mapping & UI Component](./task_usage_balance_ui.md) - Parent task
- [Balance & Credits System Explained](./balance_credits_explained.md) - Simple explanation
- [Backend Deep Dive](./backend_deep_dive.md) - Backend architecture
- [Dashboard Implementation Roadmap](./dashboard_implementation_roadmap.md) - Future UI work

---

## 📝 Next Steps

1. ✅ Review and approve this analysis
2. Create PricingService.js
3. Extend Transaction schema
4. Update Transaction.js and spendTokens.js
5. Update AI clients
6. Run database migration
7. Test end-to-end flow
8. Deploy to staging environment

---

**Document Status:** Ready for implementation  
**Last Updated:** 2025-10-05  
**Author:** Cascade AI Assistant
