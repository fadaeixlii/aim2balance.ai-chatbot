# Task: Usage/Balance Mapping & UI Component Implementation

**Date:** 2025-10-04  
**Assignee:** Mohammad M-Khani  
**Priority:** High  
**Epic:** Dashboard & Wallet Implementation

---

## 📋 Task Overview

**Goal:** Map current LibreChat usage/balance logic to aim2balance.ai requirements for multi-tenant cost + environmental metering, then ship a UI component to surface usage data.

**Reference:** This task builds on the [Dashboard Concept](./dashboard_concept.md) and [Dashboard Implementation Roadmap](./dashboard_implementation_roadmap.md).

**Related Documentation:**
- 📊 [Gap 2: EUR Cost Tracking Analysis](./gap2_eur_cost_tracking_analysis.md) - Comprehensive analysis of EUR cost tracking implementation
- 📚 [Balance & Credits System Explained](./balance_credits_explained.md) - Simple explanation of how balance and credits work

---

## 🔍 PART 1: CODE AUDIT - Gap Analysis

### **What Currently Exists in LibreChat:**

#### **1. Token/Balance Infrastructure** ✅

**Database Models:**
- **Balance Schema** (`packages/data-schemas/src/schema/balance.ts`):
  - `user`: Reference to User model
  - `tokenCredits`: Number (1000 credits = $0.001 USD)
  - `autoRefillEnabled`: Boolean
  - `refillIntervalValue`, `refillIntervalUnit`: Auto-refill timing
  - `lastRefill`: Date of last refill
  - `refillAmount`: Amount to add on each refill

- **Transaction Schema** (`packages/data-schemas/src/schema/transaction.ts`):
  - `user`: Reference to User model
  - `conversationId`: String (optional)
  - `tokenType`: Enum ('prompt', 'completion', 'credits')
  - `model`: String (model name)
  - `context`: String (e.g., 'autoRefill', 'incomplete')
  - `valueKey`: String
  - `rate`: Number (multiplier for cost calculation)
  - `rawAmount`: Number (raw token count)
  - `tokenValue`: Number (calculated cost in token credits)
  - `inputTokens`, `writeTokens`, `readTokens`: Number (for structured tokens)
  - `createdAt`, `updatedAt`: Timestamps

**Core Functions:**
- **`spendTokens(txData, tokenUsage)`** (`api/models/spendTokens.js`):
  - Records token usage after API calls
  - Creates separate transactions for prompt and completion tokens
  - Updates user balance via `createTransaction()`

- **`checkBalance(req, res, txData)`** (`api/models/balanceMethods.js`):
  - Pre-request validation to ensure user has sufficient balance
  - Implements auto-refill logic if enabled
  - Throws error if balance insufficient

- **`updateBalance({ user, incrementValue, setValues })`** (`api/models/Transaction.js`):
  - Updates user balance with optimistic concurrency control
  - Handles race conditions with retry logic
  - Compatible with DocumentDB

- **`createTransaction(txData)`** (`api/models/Transaction.js`):
  - Creates transaction record
  - Calculates token value using multipliers
  - Updates balance if enabled

**API Endpoints:**
- **`GET /api/balance`** (`api/server/routes/balance.js` → `api/server/controllers/Balance.js`):
  - Returns user's current `tokenCredits`
  - Returns auto-refill settings if enabled
  - Requires JWT authentication

**UI Components:**
- **Settings Modal** (`client/src/components/Nav/Settings.tsx`):
  - Contains tabbed interface with "Balance" tab
  - Conditionally shown if `startupConfig.balance.enabled`
  
- **Balance Tab** (`client/src/components/Nav/SettingsTabs/Balance/Balance.tsx`):
  - Displays `TokenCreditsItem` component
  - Shows `AutoRefillSettings` if enabled
  
- **TokenCreditsItem** (`client/src/components/Nav/SettingsTabs/Balance/TokenCreditsItem.tsx`):
  - Displays current token credits (formatted to 2 decimals)
  - Simple label + value display

#### **2. Token Tracking Flow** ✅

**Pre-Request Estimation:**
- `getTokenCount(text)` in `OpenAIClient.js` (line 309)
- Uses tokenizer library (`cl100k_base` for modern models)
- `buildMessages()` constructs payload and counts tokens for context management

**Post-Request Recording:**
- AI provider returns `usage` object with exact token counts
- `recordTokenUsage({ promptTokens, completionTokens })` called (line 1022 in `OpenAIClient.js`)
- Calls `spendTokens()` to create transaction records

**Files Involved:**
- `api/app/clients/OpenAIClient.js`
- `api/app/clients/AnthropicClient.js`
- `api/app/clients/GoogleClient.js`
- `api/app/clients/BaseClient.js`
- `api/models/spendTokens.js`
- `api/models/Transaction.js`

---

### **What's MISSING for Multi-Tenant Cost + Environmental Metering:**

#### **❌ Gap 1: No Per-Tenant/Organization Grouping**

**Current State:** Only per-user tracking exists  
**Needed:** Tenant/organization-level aggregation for multi-tenant cost tracking

**Action Required:**
- Add `tenantId` or `organizationId` field to:
  - User model
  - Balance model
  - Transaction model
- Implement tenant-level aggregation queries
- Add tenant filtering to all usage endpoints

**Estimated Effort:** 4-6 hours

---

#### **❌ Gap 2: No EUR Cost Tracking**

**Current State:** Only abstract token credits (1000 credits = $0.001 USD)  
**Needed:** Actual EUR cost per request for billing transparency

**Action Required:**
- Add `costEUR` field to Transaction model
- Implement conversion logic: tokens → USD → EUR
- Store provider-specific pricing configuration:
  - Model-specific rates (e.g., GPT-4: $0.03/1K input, $0.06/1K output)
  - Provider markup (+15% margin)
  - Rebalancing fee (+2-3%)
- Create `PricingService.js` to centralize pricing logic
- Update `spendTokens()` to calculate and store EUR cost

**Estimated Effort:** 6-8 hours

---

#### **❌ Gap 3: No Environmental Metrics**

**Current State:** Only token counts tracked  
**Needed:** Energy (kWh), water (L), CO₂e, and m² restored calculations

**Action Required:**
- Add fields to Transaction model:
  - `kWh`: Number (energy consumption)
  - `waterL`: Number (water usage)
  - `co2e`: Number (CO₂ equivalent)
  - `m2Restored`: Number (square meters of ecosystem restored)
- Implement environmental calculation service:
  - Map model → energy consumption per token
  - Convert energy → water usage
  - Calculate CO₂ emissions
  - Convert to m² restored via Bergwaldprojekt rates
- Capture inference duration where available (from provider APIs)
- Add `durationMs` field to Transaction model

**Estimated Effort:** 8-12 hours (excluding research for conversion factors)

---

#### **❌ Gap 4: No Request Metadata**

**Current State:** Basic model/conversation tracking  
**Needed:** Provider, endpoint, duration, and request type for detailed analytics

**Action Required:**
- Add fields to Transaction model:
  - `provider`: String (e.g., 'openai', 'anthropic', 'google')
  - `endpoint`: String (e.g., 'chat/completions', 'messages')
  - `durationMs`: Number (request duration)
  - `requestType`: String (e.g., 'chat', 'completion', 'embedding')
- Update all AI clients to capture and pass this metadata
- Ensure timestamp precision for time-series analysis

**Estimated Effort:** 3-4 hours

---

#### **❌ Gap 5: No Aggregation/Analytics Endpoints**

**Current State:** Only raw balance retrieval (`GET /api/balance`)  
**Needed:** Summary, breakdown, and detailed logs for dashboard

**Action Required:**

Create new API endpoints:

1. **`GET /api/usage/summary?range=<period>&tenant=<id>`**
   - Returns: `{ totalTokens, totalCost, totalRequests, dateRange }`
   - Aggregates all transactions for the period

2. **`GET /api/usage/breakdown?by=provider|project|model&range=<period>`**
   - Returns array of: `{ name, tokens, cost, requests, percentage }`
   - Groups by specified dimension

3. **`GET /api/usage/log?range=<period>&page=<num>&limit=<num>`**
   - Returns paginated transaction log
   - Includes: date, project, model, provider, tokens, cost

4. **`GET /api/usage/environmental?range=<period>`**
   - Returns: `{ totalKWh, totalWaterL, totalCO2e, totalM2Restored }`
   - Aggregates environmental metrics

**Files to Create:**
- `api/server/routes/usage.js`
- `api/server/controllers/UsageController.js`
- `api/utils/dateFilters.js`
- `api/models/usageQueries.js`

**Estimated Effort:** 10-12 hours

---

#### **❌ Gap 6: No Comprehensive UI Dashboard**

**Current State:** Simple balance display in settings modal  
**Needed:** Full-featured usage dashboard with charts and analytics

**Action Required:** See Part 2 below

**Estimated Effort:** 20-25 hours

---

## 📊 PART 2: UI PROTOTYPE - Usage/Balance Component

### **Placement Options:**

#### **Option A: Left Sidebar Item** ✅ **RECOMMENDED**

**Implementation:**
- Add new navigation item in `client/src/components/Nav/Nav.tsx`
- Icon: `<Activity>` or `<BarChart3>` from lucide-react
- Label: "Usage & Balance" or "Dashboard"
- Opens full-page dashboard view (new route: `/dashboard`)
- Positioned below "New Chat" or in user menu section

**Pros:**
- Highly visible and accessible
- Consistent with existing navigation pattern
- Room for full dashboard layout

**Cons:**
- Takes up sidebar space
- May require collapsible sections

#### **Option B: Slide-out Drawer**

**Implementation:**
- Small icon in top-right corner (near user avatar)
- Triggers slide-out panel from right side
- Similar to AI EnviroTracker Chrome extension
- Overlay with backdrop blur

**Pros:**
- Compact, non-intrusive
- Quick access without navigation
- Modern, polished feel

**Cons:**
- Limited space for complex charts
- May feel cramped on mobile

**Recommendation:** Start with **Option A** for better UX and easier implementation.

---

### **Component Structure:**

```
client/src/components/Dashboard/
├── UsageDashboard/
│   ├── index.tsx                    # Main dashboard container
│   ├── WalletCard.tsx              # Balance display + top-up CTA
│   ├── UsageSummary.tsx            # Date filter + totals
│   ├── ProviderBreakdown.tsx       # Donut chart by provider
│   ├── ProjectBreakdown.tsx        # Bar chart by project/agent
│   ├── UsageTable.tsx              # Detailed transaction log
│   └── EnvironmentalMetrics.tsx    # kWh, CO₂, m² (stub for now)
└── shared/
    ├── DateRangeFilter.tsx         # Reusable date picker
    └── MetricCard.tsx              # Reusable stat card
```

---

### **Component Details:**

#### **1. WalletCard.tsx**

**Purpose:** Display current balance and provide top-up action

**Data Displayed:**
- Current token credits (from existing `GET /api/balance`)
- Estimated EUR value (calculated client-side or from new endpoint)
- Visual indicator (progress bar or color-coded badge)
- "Add Credits" button → Stripe checkout
- "View History" link → transaction log

**Mock/Real:**
- ✅ Real: `tokenCredits` from existing API
- ⚠️ Mock: EUR conversion (TODO: add backend calculation)
- ⚠️ Stub: Stripe integration (TODO: implement billing flow)

**Example:**
```tsx
<Card>
  <Text>Wallet Balance</Text>
  <Metric>{tokenCredits.toFixed(2)} credits</Metric>
  <Text className="text-sm text-gray-500">~€{eurValue.toFixed(2)}</Text>
  <ProgressBar value={balancePercentage} color="emerald" />
  <Button onClick={handleTopUp}>Add Credits</Button>
</Card>
```

---

#### **2. UsageSummary.tsx**

**Purpose:** Show high-level usage metrics with date filtering

**Data Displayed:**
- Date range selector (Last 7 days, Last 30 days, This month, Custom)
- Total tokens used
- Total cost (EUR)
- Total API calls
- Average cost per request

**Mock/Real:**
- ⚠️ Mock: All data (TODO: implement `GET /api/usage/summary`)
- Example mock data:
  ```js
  {
    totalTokens: 1250000,
    totalCost: 45.67,
    totalRequests: 342,
    avgCostPerRequest: 0.13
  }
  ```

---

#### **3. ProviderBreakdown.tsx**

**Purpose:** Visualize usage distribution across AI providers

**Data Displayed:**
- Donut chart showing percentage by provider
- Legend with provider names, token counts, and costs
- Providers: OpenAI, Anthropic, Google, Groq, OpenRouter, Ollama

**Mock/Real:**
- ⚠️ Mock: All data (TODO: implement `GET /api/usage/breakdown?by=provider`)
- Example mock data:
  ```js
  [
    { provider: 'OpenAI', tokens: 850000, cost: 32.50, percentage: 68 },
    { provider: 'Anthropic', tokens: 300000, cost: 10.20, percentage: 24 },
    { provider: 'Google', tokens: 100000, cost: 2.97, percentage: 8 }
  ]
  ```

**Library:** Use Tremor's `<DonutChart>` component

---

#### **4. ProjectBreakdown.tsx**

**Purpose:** Show usage by project/agent/conversation

**Data Displayed:**
- Horizontal bar chart
- Each bar represents a project or agent
- Segmented by provider (stacked bar)
- Sortable by tokens or cost

**Mock/Real:**
- ⚠️ Mock: All data (TODO: implement `GET /api/usage/breakdown?by=project`)
- ⚠️ Note: Requires linking `conversationId` → `Conversation` → `Agent`
- Example mock data:
  ```js
  [
    { project: 'Research Assistant', tokens: 450000, cost: 18.50 },
    { project: 'Code Helper', tokens: 380000, cost: 15.20 },
    { project: 'General Chat', tokens: 420000, cost: 12.00 }
  ]
  ```

**Library:** Use Tremor's `<BarChart>` component

---

#### **5. UsageTable.tsx**

**Purpose:** Detailed, sortable log of all AI interactions

**Columns:**
- Date/Time
- Project/Agent Name
- Model (e.g., `gpt-4-turbo`, `claude-3-opus`)
- Provider
- Input Tokens
- Output Tokens
- Total Tokens
- Cost (EUR)

**Features:**
- Sortable columns
- Pagination (20 rows per page)
- Search/filter by model or project
- Export to CSV (future)

**Mock/Real:**
- ✅ Real: Can query existing Transaction model
- ⚠️ Needs: New endpoint `GET /api/usage/log` with pagination
- ⚠️ Mock: Project names (requires conversation lookup)

**Library:** Use Tremor's `<Table>` component or custom table with sorting

---

#### **6. EnvironmentalMetrics.tsx**

**Purpose:** Display environmental impact (future feature)

**Data Displayed:**
- Total energy consumed (kWh)
- Water usage (L)
- CO₂ emissions (kg)
- Ecosystem restored (m²)
- Visual: Tree icon or nature imagery

**Mock/Real:**
- ⚠️ **STUB ONLY** for now
- Display placeholder values with clear "Coming Soon" message
- Add TODO comments in code:
  ```tsx
  // TODO: Implement environmental calculation service
  // TODO: Add kWh, waterL, co2e, m2Restored to Transaction model
  // TODO: Connect to Bergwaldprojekt donation tracking
  ```

**Example Stub:**
```tsx
<Card className="opacity-50">
  <Text>Environmental Impact</Text>
  <Text className="text-sm text-gray-500">Coming Soon</Text>
  <div className="mt-4 space-y-2">
    <div>⚡ Energy: -- kWh</div>
    <div>💧 Water: -- L</div>
    <div>🌍 CO₂: -- kg</div>
    <div>🌳 Restored: -- m²</div>
  </div>
</Card>
```

---

### **Data Flow:**

```
User → Dashboard Component
         ↓
    React Query Hooks
         ↓
    API Endpoints (new)
         ↓
    Controller Logic
         ↓
    MongoDB Aggregation
         ↓
    Transaction Collection
```

**New Hooks to Create:**
- `useUsageSummary(dateRange)`
- `useProviderBreakdown(dateRange)`
- `useProjectBreakdown(dateRange)`
- `useUsageLog(dateRange, page, limit)`

**File:** `client/src/data-provider/usage.ts`

---

## ✅ CONCRETE TASKS (Implementation Checklist)

### **Epic 1: Backend - Data Model Extensions**

| Task ID | Task | Files to Modify | Effort | Status |
|---------|------|-----------------|--------|--------|
| BE-1.1 | Add `costEUR`, `provider`, `endpoint`, `durationMs` to Transaction schema | `packages/data-schemas/src/schema/transaction.ts` | 1h | ⬜ TODO |
| BE-1.2 | Add environmental fields (`kWh`, `waterL`, `co2e`, `m2Restored`) to Transaction schema | `packages/data-schemas/src/schema/transaction.ts` | 30min | ⬜ TODO |
| BE-1.3 | Update `spendTokens()` to calculate and store EUR cost | `api/models/spendTokens.js` | 2h | ⬜ TODO |
| BE-1.4 | Create `PricingService.js` (provider → model → EUR/token) | `api/services/PricingService.js` (new) | 3h | ⬜ TODO |
| BE-1.5 | Add provider/endpoint tracking to all AI clients | `api/app/clients/*.js` | 2h | ⬜ TODO |
| BE-1.6 | Run database migration to add new fields | Migration script | 1h | ⬜ TODO |

**Total Effort:** ~9.5 hours

---

### **Epic 2: Backend - Analytics Endpoints**

| Task ID | Task | Files to Create/Modify | Effort | Status |
|---------|------|------------------------|--------|--------|
| BE-2.1 | Create `GET /api/usage/summary` endpoint | `api/server/routes/usage.js`, `api/server/controllers/UsageController.js` | 3h | ⬜ TODO |
| BE-2.2 | Create `GET /api/usage/breakdown` endpoint (provider/project/model) | Same as above | 4h | ⬜ TODO |
| BE-2.3 | Create `GET /api/usage/log` endpoint (paginated) | Same as above | 2h | ⬜ TODO |
| BE-2.4 | Add date range filtering utility | `api/utils/dateFilters.js` (new) | 1h | ⬜ TODO |
| BE-2.5 | Add aggregation queries for Transaction model | `api/models/usageQueries.js` (new) | 2h | ⬜ TODO |
| BE-2.6 | Add JWT auth middleware to all new routes | `api/server/routes/usage.js` | 30min | ⬜ TODO |
| BE-2.7 | Write unit tests for new endpoints | `api/server/controllers/UsageController.spec.js` | 3h | ⬜ TODO |

**Total Effort:** ~15.5 hours

---

### **Epic 3: Frontend - UI Components**

| Task ID | Task | Files to Create | Effort | Status |
|---------|------|-----------------|--------|--------|
| FE-3.1 | Create `UsageDashboard` main container | `client/src/components/Dashboard/UsageDashboard/index.tsx` | 2h | ⬜ TODO |
| FE-3.2 | Create `WalletCard` component (balance + top-up) | `client/src/components/Dashboard/UsageDashboard/WalletCard.tsx` | 2h | ⬜ TODO |
| FE-3.3 | Create `UsageSummary` with date filter | `client/src/components/Dashboard/UsageDashboard/UsageSummary.tsx` | 3h | ⬜ TODO |
| FE-3.4 | Create `ProviderBreakdown` donut chart | `client/src/components/Dashboard/UsageDashboard/ProviderBreakdown.tsx` | 2h | ⬜ TODO |
| FE-3.5 | Create `ProjectBreakdown` bar chart | `client/src/components/Dashboard/UsageDashboard/ProjectBreakdown.tsx` | 2h | ⬜ TODO |
| FE-3.6 | Create `UsageTable` with sorting/pagination | `client/src/components/Dashboard/UsageDashboard/UsageTable.tsx` | 3h | ⬜ TODO |
| FE-3.7 | Create stub `EnvironmentalMetrics` component | `client/src/components/Dashboard/UsageDashboard/EnvironmentalMetrics.tsx` | 1h | ⬜ TODO |
| FE-3.8 | Add navigation item (sidebar) | `client/src/components/Nav/Nav.tsx` | 1h | ⬜ TODO |
| FE-3.9 | Create data provider hooks (react-query) | `client/src/data-provider/usage.ts` | 2h | ⬜ TODO |
| FE-3.10 | Add routing for dashboard page | `client/src/routes.tsx` | 30min | ⬜ TODO |
| FE-3.11 | Install Tremor charting library | `package.json` | 15min | ⬜ TODO |
| FE-3.12 | Create shared `DateRangeFilter` component | `client/src/components/Dashboard/shared/DateRangeFilter.tsx` | 1.5h | ⬜ TODO |
| FE-3.13 | Create shared `MetricCard` component | `client/src/components/Dashboard/shared/MetricCard.tsx` | 1h | ⬜ TODO |

**Total Effort:** ~21 hours

---

### **Epic 4: Integration & Polish**

| Task ID | Task | Effort | Status |
|---------|------|--------|--------|
| INT-4.1 | Wire real API data to UI components (replace mocks) | 2h | ⬜ TODO |
| INT-4.2 | Add loading states and error handling | 1h | ⬜ TODO |
| INT-4.3 | Add mock/stub data for missing metrics (with TODOs) | 1h | ⬜ TODO |
| INT-4.4 | Test with multiple users/conversations | 2h | ⬜ TODO |
| INT-4.5 | Responsive design adjustments (mobile/tablet) | 2h | ⬜ TODO |
| INT-4.6 | Add empty states (no data yet) | 1h | ⬜ TODO |
| INT-4.7 | Performance optimization (memoization, lazy loading) | 1.5h | ⬜ TODO |
| INT-4.8 | Accessibility audit (ARIA labels, keyboard nav) | 1.5h | ⬜ TODO |

**Total Effort:** ~12 hours

---

## 📝 DELIVERABLES

### **1. Demo**
- [ ] Working UI component accessible from sidebar
- [ ] All charts rendering with mock data
- [ ] Date filter functional
- [ ] Table with sorting/pagination
- [ ] Responsive on desktop and mobile

### **2. Files Touched**

**Backend:**
- `packages/data-schemas/src/schema/transaction.ts` - Extended schema
- `api/models/spendTokens.js` - EUR cost calculation
- `api/services/PricingService.js` - NEW: Pricing logic
- `api/server/routes/usage.js` - NEW: Usage endpoints
- `api/server/controllers/UsageController.js` - NEW: Controller logic
- `api/utils/dateFilters.js` - NEW: Date range utilities
- `api/models/usageQueries.js` - NEW: Aggregation queries
- `api/app/clients/*.js` - Provider/endpoint tracking

**Frontend:**
- `client/src/components/Dashboard/UsageDashboard/*` - NEW: All dashboard components
- `client/src/components/Nav/Nav.tsx` - Added navigation item
- `client/src/data-provider/usage.ts` - NEW: React Query hooks
- `client/src/routes.tsx` - Added dashboard route
- `package.json` - Added Tremor dependency

### **3. What's Missing (TODOs)**

**High Priority:**
- [ ] Environmental metric calculation service
- [ ] Multi-tenant/organization grouping
- [ ] Stripe integration for top-ups
- [ ] LiteLLM proxy integration for unified cost tracking
- [ ] Real-time usage updates (WebSocket or polling)

**Medium Priority:**
- [ ] Export to CSV/PDF
- [ ] Usage alerts (e.g., 80% balance consumed)
- [ ] Budget limits per project/user
- [ ] Historical trend analysis (charts over time)

**Low Priority:**
- [ ] Dark mode optimization for charts
- [ ] Custom date range picker
- [ ] Advanced filtering (by model, provider, etc.)

### **4. Open Questions**

1. **Tenant Model:**
   - Do we implement organization/tenant grouping now, or start with per-user and add later?
   - **Recommendation:** Start per-user, add tenant support in Phase 2

2. **Pricing Source:**
   - Hardcoded in config file, external API, or database table?
   - **Recommendation:** Config file for MVP, move to database for dynamic updates

3. **Environmental Calculations:**
   - Do we have conversion factors ready (tokens → kWh → CO₂)?
   - **Recommendation:** Research and document in separate ticket

4. **Stripe Integration:**
   - Should top-up button be functional in this task, or separate ticket?
   - **Recommendation:** Separate ticket (see [Billing Implementation Guide](./implementation_billing_stripe.md))

5. **Real-time Updates:**
   - Should dashboard auto-refresh, or manual refresh only?
   - **Recommendation:** Manual refresh for MVP, add polling in Phase 2

---

## 🎯 RECOMMENDED IMPLEMENTATION PHASES

### **Phase 1: Quick Prototype (2-3 days)**

**Goal:** Demonstrate UI with existing data

**Tasks:**
- BE-1.1, BE-1.2 (extend schema)
- BE-2.1 (basic summary endpoint)
- FE-3.1, FE-3.2, FE-3.6, FE-3.8 (minimal UI)
- INT-4.3 (mock data)

**Deliverable:** Working dashboard with mock data, real balance display

---

### **Phase 2: Full Backend (1 week)**

**Goal:** Complete all analytics endpoints

**Tasks:**
- All BE-1.* tasks
- All BE-2.* tasks
- INT-4.1 (wire real data)

**Deliverable:** Fully functional backend with real usage data

---

### **Phase 3: Complete UI (1 week)**

**Goal:** Build all dashboard components

**Tasks:**
- All FE-3.* tasks
- All INT-4.* tasks

**Deliverable:** Production-ready dashboard

---

### **Phase 4: Future Enhancements (Post-MVP)**

**Goal:** Add advanced features

**Tasks:**
- Environmental metrics calculation
- Multi-tenant support
- Stripe integration
- Export/reporting
- Real-time updates

---

## 📚 Related Documentation

- [Dashboard Concept](./dashboard_concept.md)
- [Dashboard Implementation Roadmap](./dashboard_implementation_roadmap.md)
- [Token Usage Analysis](./token_usage_analysis.md)
- [Billing Implementation Guide](./implementation_billing_stripe.md)
- [Architecture and Data Flow](./architecture_and_data_flow.md)

---

## 🔗 External References

- [AI EnviroTracker Chrome Extension](https://chromewebstore.google.com/detail/ai-enviro-tracker/oaleiaiblmnilbkghbfefnhcbhfmeake) - UI inspiration
- [Tremor Documentation](https://www.tremor.so/) - Charting library
- [ClickUp Project](https://app.clickup.com/9012254402/v/dc/8cjr5p2-5332) - Task tracking

---

**Last Updated:** 2025-10-04  
**Status:** 🟡 In Progress
