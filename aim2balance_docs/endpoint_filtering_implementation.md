# Endpoint Filtering Implementation - aim2balance.ai Strategy

**Date:** 2025-10-05  
**Status:** Implemented  
**Strategy:** Show only endpoints with admin-configured API keys

---

## 📋 Overview

This document describes the implementation of endpoint filtering in the aim2balance.ai chat interface. The goal is to **show only AI providers (endpoints) that have API keys configured by the administrator**, preventing users from seeing or attempting to use endpoints they cannot access.

### Key Principle
**Users cannot provide their own API keys.** Only endpoints with admin-configured keys in `.env` are displayed in the model selector.

---

## 🎯 Business Logic

### Before Implementation (LibreChat Default)
- All endpoints are shown to users
- Users can click a settings icon to provide their own API keys
- Endpoints without admin keys show "user_provided" status

### After Implementation (aim2balance.ai)
- **Only endpoints with admin-configured API keys are shown**
- Users cannot provide their own keys
- Settings buttons for user-provided keys are hidden
- Cleaner, simpler UI focused on available services

---

## 🔧 Implementation Details

### 1. Backend Configuration

**File:** `api/server/services/Config/EndpointService.js`

The backend determines which endpoints require user-provided keys based on environment variables:

```javascript
const { isUserProvided } = require('@librechat/api');

// Example: Check if OpenAI key is user-provided
const openAIApiKey = process.env.OPENAI_API_KEY;
const userProvidedOpenAI = isUserProvided(openAIApiKey);
// Returns true if OPENAI_API_KEY === 'user_provided'
// Returns false if OPENAI_API_KEY has an actual key
```

**Key Function:** `generateConfig()`
```javascript
function generateConfig(key, baseURL, endpoint) {
  if (!key) {
    return false; // Endpoint disabled
  }
  
  const config = { 
    userProvide: isUserProvided(key) // true if key === 'user_provided'
  };
  
  return config;
}
```

**Configuration Flow:**
```
.env file
  ↓
OPENAI_API_KEY=sk-abc123...  → userProvide: false (admin key configured)
GOOGLE_KEY=user_provided     → userProvide: true (no admin key)
ANTHROPIC_API_KEY=           → endpoint disabled (no key at all)
  ↓
EndpointService.js
  ↓
getEndpointsConfig()
  ↓
Frontend receives endpointsConfig with userProvide flags
```

---

### 2. Backend Custom Endpoint Filtering

**File:** `packages/api/src/endpoints/custom/config.ts`

Custom endpoints defined in `librechat.yaml` are now filtered at the backend level:

**Modified Code:**
```typescript
// aim2balance.ai: Skip custom endpoints without valid API keys
// Only show endpoints where admin has configured actual API keys
// This prevents showing endpoints that users cannot use
const hasValidApiKey = resolvedApiKey && !isUserProvided(resolvedApiKey);

if (!hasValidApiKey) {
  // Commented out for potential reversal: Allow showing user-provided custom endpoints
  // To re-enable user-provided custom endpoints, uncomment the code below:
  // customEndpointsConfig[name] = { ... };
  continue;
}
```

**Logic:**
1. Extract API key from environment variable (e.g., `${GROQ_API_KEY}`)
2. Check if key is valid and not `user_provided`
3. If no valid key, skip adding this endpoint to config
4. Only endpoints with real API keys are returned to frontend

**Example:**
```yaml
# librechat.yaml
endpoints:
  custom:
    - name: 'groq'
      apiKey: '${GROQ_API_KEY}'  # References .env variable
```

```bash
# .env
GROQ_API_KEY=gsk_abc123...  # Real key → ✅ Shows Groq
# GROQ_API_KEY not set        # No key → ❌ Hides Groq
```

---

### 3. Frontend Filtering

**File:** `client/src/hooks/Endpoint/useEndpoints.ts`

**Modified Code:**
```typescript
const filteredEndpoints = useMemo(() => {
  if (!interfaceConfig.modelSelect) {
    return [];
  }
  const result: EModelEndpoint[] = [];
  for (let i = 0; i < endpoints.length; i++) {
    if (endpoints[i] === EModelEndpoint.agents && !hasAgentAccess) {
      continue;
    }
    if (includedEndpoints.size > 0 && !includedEndpoints.has(endpoints[i])) {
      continue;
    }

    // aim2balance.ai: Filter out endpoints that require user-provided keys
    // Only show endpoints where the admin has configured API keys
    // This prevents showing endpoints that users cannot use
    const endpointConfig = endpointsConfig?.[endpoints[i]];
    const requiresUserKey = endpointConfig?.userProvide === true;

    // Skip endpoints that require user-provided keys (no admin key configured)
    if (requiresUserKey) {
      // Commented out for potential reversal: Allow showing user-provided endpoints
      // To re-enable user-provided endpoints, uncomment the line below:
      // result.push(endpoints[i]);
      continue;
    }

    result.push(endpoints[i]);
  }

  return result;
}, [endpoints, hasAgentAccess, includedEndpoints, interfaceConfig.modelSelect, endpointsConfig]);
```

**Logic Explanation:**
1. Loop through all available endpoints
2. Check if endpoint requires user-provided key (`userProvide === true`)
3. If yes, skip it (don't add to result)
4. If no, add it to the list of available endpoints

---

### 3. UI Changes

**File:** `client/src/components/Chat/Menus/Endpoints/components/EndpointItem.tsx`

**Commented Out Settings Buttons:**

```tsx
// Before (LibreChat default):
{isUserProvided && (
  <SettingsButton endpoint={endpoint} handleOpenKeyDialog={handleOpenKeyDialog} />
)}

// After (aim2balance.ai):
{/* aim2balance.ai: Commented out user-provided key settings button */}
{/* Users cannot provide their own API keys in aim2balance.ai strategy */}
{/* To re-enable, uncomment the lines below: */}
{/* {isUserProvided && (
  <SettingsButton endpoint={endpoint} handleOpenKeyDialog={handleOpenKeyDialog} />
)} */}
```

**Why Commented Instead of Deleted:**
- Easy to reverse if business requirements change
- Clear documentation of what was changed
- Maintains code structure for future reference

---

## 📊 Example Scenarios

### Scenario 1: Only Google Gemini Configured

**.env:**
```bash
GOOGLE_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuv
OPENAI_API_KEY=user_provided
ANTHROPIC_API_KEY=user_provided
# GROQ_API_KEY not set
# MISTRAL_API_KEY not set
# OPENROUTER_KEY not set
```

**librechat.yaml:**
```yaml
endpoints:
  custom:
    - name: 'groq'
      apiKey: '${GROQ_API_KEY}'
    - name: 'Mistral'
      apiKey: '${MISTRAL_API_KEY}'
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
```

**Result:**
- ✅ **Google Gemini** is shown (admin key configured)
- ❌ OpenAI is hidden (requires user key)
- ❌ Anthropic is hidden (requires user key)
- ❌ Groq is hidden (no API key in .env)
- ❌ Mistral is hidden (no API key in .env)
- ❌ OpenRouter is hidden (no API key in .env)

---

### Scenario 2: Multiple Providers Configured

**.env:**
```bash
GOOGLE_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuv
OPENAI_API_KEY=sk-1234567890abcdefghijklmnopqrstuv
GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuv
ANTHROPIC_API_KEY=user_provided
```

**Result:**
- ✅ **Google Gemini** is shown
- ✅ **OpenAI** is shown
- ✅ **Groq** is shown (if configured in librechat.yaml)
- ❌ Anthropic is hidden (requires user key)

---

### Scenario 3: Custom Endpoints via librechat.yaml

**librechat.yaml:**
```yaml
endpoints:
  custom:
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['meta-llama/llama-3-8b-instruct:free']
```

**.env:**
```bash
OPENROUTER_KEY=sk-or-v1-1234567890abcdefghijklmnopqrstuv
```

**Result:**
- ✅ **OpenRouter** is shown (admin key configured)

---

## 🔄 How to Reverse the Changes

If you need to allow users to provide their own API keys again:

### Step 1: Re-enable Endpoint Filtering

**File:** `client/src/hooks/Endpoint/useEndpoints.ts`

**Change this:**
```typescript
if (requiresUserKey) {
  // Commented out for potential reversal: Allow showing user-provided endpoints
  // To re-enable user-provided endpoints, uncomment the line below:
  // result.push(endpoints[i]);
  continue;
}
```

**To this:**
```typescript
if (requiresUserKey) {
  // Re-enabled: Allow showing user-provided endpoints
  result.push(endpoints[i]);
  // continue; // Comment out the continue statement
}
```

---

### Step 2: Re-enable Settings Buttons

**File:** `client/src/components/Chat/Menus/Endpoints/components/EndpointItem.tsx`

**Uncomment both occurrences:**

**Location 1 (line ~131):**
```tsx
{/* aim2balance.ai: Commented out user-provided key settings button */}
{/* Users cannot provide their own API keys in aim2balance.ai strategy */}
{/* To re-enable, uncomment the lines below: */}
{isUserProvided && (
  <SettingsButton endpoint={endpoint} handleOpenKeyDialog={handleOpenKeyDialog} />
)}
```

**Location 2 (line ~165):**
```tsx
{/* aim2balance.ai: Commented out user-provided key settings button */}
{/* Users cannot provide their own API keys in aim2balance.ai strategy */}
{/* To re-enable, uncomment the lines below: */}
{endpointRequiresUserKey(endpoint.value) && (
  <SettingsButton endpoint={endpoint} handleOpenKeyDialog={handleOpenKeyDialog} />
)}
```

---

## 🧪 Testing

### Test Case 1: Verify Filtering Works

1. Set `.env`:
   ```bash
   GOOGLE_KEY=AIzaSyD_your_key_here
   OPENAI_API_KEY=user_provided
   ```

2. Start the application:
   ```bash
   npm run backend
   npm run frontend
   ```

3. Open http://localhost:3080
4. Click on the model selector dropdown
5. **Expected:** Only Google Gemini is shown
6. **Expected:** No settings icon appears next to endpoints

---

### Test Case 2: Verify Multiple Endpoints

1. Set `.env`:
   ```bash
   GOOGLE_KEY=AIzaSyD_your_key_here
   OPENAI_API_KEY=sk_your_key_here
   GROQ_API_KEY=gsk_your_key_here
   ```

2. Configure `librechat.yaml`:
   ```yaml
   endpoints:
     custom:
       - name: 'groq'
         apiKey: '${GROQ_API_KEY}'
         baseURL: 'https://api.groq.com/openai/v1/'
         models:
           default: ['llama3-70b-8192']
   ```

3. Restart and check model selector
4. **Expected:** Google, OpenAI, and Groq are all shown

---

### Test Case 3: Verify No Settings Buttons

1. With any configuration, open model selector
2. **Expected:** No gear/settings icons appear
3. **Expected:** Users cannot click to add their own API keys

---

## 📝 Configuration Guide for Admins

### How to Add a New AI Provider

**Step 1: Get API Key**
- Follow the guide: [Getting Free API Keys](./getting_free_api_keys.md)

**Step 2: Add to `.env`**
```bash
# For standard endpoints
GOOGLE_KEY=your_actual_key_here
OPENAI_API_KEY=your_actual_key_here
ANTHROPIC_API_KEY=your_actual_key_here

# For custom endpoints
GROQ_API_KEY=your_actual_key_here
OPENROUTER_KEY=your_actual_key_here
```

**Step 3: Configure `librechat.yaml` (for custom endpoints)**
```yaml
endpoints:
  custom:
    - name: 'Groq'
      apiKey: '${GROQ_API_KEY}'
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default: ['llama3-70b-8192', 'llama3-8b-8192']
```

**Step 4: Restart Application**
```bash
# Docker
docker-compose restart

# npm
npm run backend
```

---

### How to Remove an AI Provider

**Option 1: Remove API Key**
```bash
# In .env, remove or comment out the key
# GOOGLE_KEY=AIzaSyD_your_key_here
```

**Option 2: Set to user_provided (hides it)**
```bash
# In .env
GOOGLE_KEY=user_provided
```

**Option 3: Disable in librechat.yaml**
```yaml
# Comment out the endpoint configuration
# endpoints:
#   custom:
#     - name: 'Groq'
#       apiKey: '${GROQ_API_KEY}'
```

---

## 🔍 Troubleshooting

### Issue: Endpoint Not Showing Up

**Possible Causes:**
1. API key not set in `.env`
2. API key set to `user_provided`
3. Endpoint not enabled in `librechat.yaml`
4. Application not restarted after config change

**Solution:**
```bash
# 1. Check .env
cat .env | grep GOOGLE_KEY
# Should show: GOOGLE_KEY=AIzaSyD...

# 2. Restart application
docker-compose restart
# or
npm run backend
```

---

### Issue: All Endpoints Hidden

**Possible Cause:** All API keys set to `user_provided`

**Solution:**
```bash
# In .env, set at least one real API key
GOOGLE_KEY=AIzaSyD_your_actual_key_here
```

---

### Issue: Want to Re-enable User-Provided Keys

**Solution:** Follow the "How to Reverse the Changes" section above

---

## 📚 Related Documentation

- [Configuration Guide](./configuration_guide.md) - Complete configuration reference
- [Getting Free API Keys](./getting_free_api_keys.md) - How to obtain API keys
- [Balance & Credits System](./balance_credits_explained.md) - How billing works

---

## 🏗️ Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    .env File                                 │
│  GOOGLE_KEY=AIzaSyD...  (real key)                          │
│  OPENAI_API_KEY=user_provided  (no admin key)               │
│  # GROQ_API_KEY not set                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend: EndpointService.js                     │
│  generateConfig() checks standard endpoint keys:             │
│    - Real key → userProvide: false                           │
│    - 'user_provided' → userProvide: true                     │
│    - Empty → endpoint disabled                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Backend: loadCustomEndpointsConfig()                 │
│  Filters custom endpoints from librechat.yaml:               │
│    - Extracts ${GROQ_API_KEY} from env                       │
│    - If no key or 'user_provided' → ❌ SKIP                  │
│    - If real key → ✅ ADD to config                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend: getEndpointsConfig()                   │
│  Merges and returns endpointsConfig:                         │
│  {                                                            │
│    google: { userProvide: false },                           │
│    openAI: { userProvide: true }                             │
│    // groq not included (no API key)                         │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Frontend: useEndpoints.ts                       │
│  Filters remaining endpoints:                                │
│    - google: userProvide=false → ✅ SHOW                     │
│    - openAI: userProvide=true → ❌ HIDE                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Frontend: ModelSelector UI                      │
│  Displays only available endpoints:                          │
│    - Google Gemini ✅                                        │
│    - (All others hidden)                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

### What Changed
1. ✅ Added backend filtering in `loadCustomEndpointsConfig()` to skip custom endpoints without API keys
2. ✅ Added frontend filtering logic in `useEndpoints.ts` to hide user-provided endpoints
3. ✅ Commented out settings buttons for user API keys in `EndpointItem.tsx`
4. ✅ All changes are reversible via uncommenting code

### What This Achieves
1. ✅ Users only see AI providers that are actually available
2. ✅ Cleaner, simpler UI without confusing settings buttons
3. ✅ Aligns with aim2balance.ai business model (admin-managed API keys)
4. ✅ Reduces user confusion and support requests

### How to Use
1. Configure API keys in `.env` file
2. Restart application
3. Only configured endpoints appear in model selector
4. Users can immediately start chatting with available models

---

**Document Status:** Complete  
**Last Updated:** 2025-10-05  
**Author:** Cascade AI Assistant  
**Implementation Status:** ✅ Implemented and Tested
