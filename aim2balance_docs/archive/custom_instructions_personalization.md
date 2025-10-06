# Custom Instructions & Personalization Analysis

This document details the research into LibreChat's personalization capabilities and provides a roadmap for implementing a "Custom Instructions" feature similar to the one found in ChatGPT.

## 1. Research Findings

A comprehensive deep-dive into the LibreChat codebase confirms that **no built-in feature for global, user-defined custom instructions currently exists**.

The term "instructions" is used consistently throughout the codebase, but it always refers to the **agent-specific system prompt** that defines an individual agent's role and personality. This is handled via the `instructions` field in the `agentSchema`.

Therefore, the conclusion remains the same: this feature must be built from the ground up. The agent-specific instructions are not an alternative but a complementary layer of personalization.

-   The `userSchema` contains a `personalization` field, but it is minimal and only includes a boolean toggle for a feature called "memories."
-   There are no fields for storing free-text instructions or user information that would be automatically applied to all conversations.

Therefore, this feature must be built from the ground up.

## 2. Agent Instructions vs. User-Level Custom Instructions

It is important to distinguish between two different layers of instruction:

-   **Agent-Specific Instructions:** This is the "Instructions" field found in the Agent Builder. It defines the core role and personality of a *single agent* (e.g., "You are a legal expert who reviews contracts"). These instructions only apply when interacting with that specific agent.
-   **User-Level Custom Instructions:** This is the global feature we are designing. It allows a user to define their personal preferences that should apply to *all* conversations (e.g., "Always respond in markdown").

These two features are not alternatives; they are complementary. The agent's instructions define its role, while the user's instructions personalize its delivery. An ideal system must combine both.

## 3. Concept & Design

The goal is to replicate the functionality seen in ChatGPT, where a user can provide two pieces of information:

1.  **Custom Instructions:** Persistent guidance on how the AI should respond (e.g., tone, style, focus).
2.  **About You:** Information about the user that the AI can use for context (e.g., profession, interests).

These instructions will be automatically prepended to the system prompt of every new conversation, ensuring the AI's responses are always tailored to the user's preferences.

### Multi-Model Compatibility

The proposed implementation is inherently compatible with multiple models. By modifying the system prompt, we are using a universal feature that all major language models (from OpenAI, Anthropic, Google, etc.) support. The primary challenge is not compatibility but ensuring the combined prompt does not exceed the context window of certain models. However, this is a general constraint of system prompts and not specific to this feature.

## 4. Implementation Guide: Step-by-Step

This guide provides the specific file paths and code changes needed to implement the Custom Instructions feature.

### Step 1: Update the User Schema

**File:** `packages/data-schemas/src/schema/user.ts`

As outlined previously, expand the `personalization` object in the `userSchema`:

```javascript
personalization: {
  type: {
    // ... existing fields
    customInstructions: { type: String, default: '' },
    aboutYou: { type: String, default: '' },
  },
  default: {},
},
```

### Step 2: Create the API Endpoints

**File:** `api/server/routes/user.js` (or a new dedicated route file)

Add two new endpoints to manage the user's personalization settings:

```javascript
// Get personalization settings
router.get('/personalization', async (req, res) => {
  const user = await User.findById(req.user.id).select('personalization');
  res.status(200).json(user.personalization || {});
});

// Update personalization settings
router.put('/personalization', async (req, res) => {
  const { customInstructions, aboutYou } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      '$set': {
        'personalization.customInstructions': customInstructions,
        'personalization.aboutYou': aboutYou,
      }
    },
    { new: true, select: 'personalization' }
  );
  res.status(200).json(updatedUser.personalization);
});
```

### Step 3: Modify the Prompt Building Logic

**File:** `api/app/clients/OpenAIClient.js` (and other clients like `GoogleClient.js`, `AnthropicClient.js`)

Locate the `buildMessages` method. Inside this method, you will find where the `instructions` or `promptPrefix` is prepared. You need to modify this section to combine the user's global instructions with the agent's specific instructions.

```javascript
// Inside the buildMessages method of OpenAIClient.js (and other clients)

// ... existing code to get messages and options

// 1. Get the agent's instructions (original logic)
let agentInstructions = this.options.promptPrefix || '';
if (this.options.agent?.instructions) {
  agentInstructions = this.options.agent.instructions;
}

// 2. Get the user's global instructions
const user = this.options.req.user;
const personalization = user.personalization || {};
const { customInstructions, aboutYou } = personalization;

// 3. Combine the instructions
let finalInstructions = agentInstructions;
const userPreamble = aboutYou ? `Here is information about the user:\n${aboutYou}` : '';
const instructionsPreamble = customInstructions ? `Here are the user's custom instructions:\n${customInstructions}` : '';

if (userPreamble || instructionsPreamble) {
  const fullPreamble = `${userPreamble}\n\n${instructionsPreamble}`.trim();
  finalInstructions = `${fullPreamble}\n\n---\n\n${agentInstructions}`;
}

// 4. Use the combined instructions when building the payload
// Replace the original use of `this.options.promptPrefix` or `agent.instructions` 
// with `finalInstructions`.

const instructionsPayload = {
  role: 'system',
  content: finalInstructions,
};

// ... continue with the rest of the buildMessages logic, using instructionsPayload
```

### Step 4: Build the Frontend UI

**File:** `client/src/components/Nav/SettingsTabs.tsx` (to add the tab) and a new component for the settings panel.

1.  **Add a "Personalization" Tab:** In `SettingsTabs.tsx`, add a new tab that opens your new personalization component.
2.  **Create the Personalization Component:**
    -   Create a new React component that contains two text areas for "Custom Instructions" and "About You."
    -   Use `react-query` or a similar library to fetch data from `/api/user/personalization` when the component mounts.
    -   On save, use a mutation to call `PUT /api/user/personalization` with the updated values.

This guide provides the specific file paths and code changes needed to implement the Custom Instructions feature.

### Step 1: Update the User Schema

**File:** `packages/data-schemas/src/schema/user.ts`

As outlined previously, expand the `personalization` object in the `userSchema`:

```javascript
personalization: {
  type: {
    // ... existing fields
    customInstructions: { type: String, default: '' },
    aboutYou: { type: String, default: '' },
  },
  default: {},
},
```

### Step 2: Create the API Endpoints

**File:** `api/server/routes/user.js` (or a new dedicated route file)

Add two new endpoints to manage the user's personalization settings:

```javascript
// Get personalization settings
router.get('/personalization', async (req, res) => {
  const user = await User.findById(req.user.id).select('personalization');
  res.status(200).json(user.personalization || {});
});

// Update personalization settings
router.put('/personalization', async (req, res) => {
  const { customInstructions, aboutYou } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      '$set': {
        'personalization.customInstructions': customInstructions,
        'personalization.aboutYou': aboutYou,
      }
    },
    { new: true, select: 'personalization' }
  );
  res.status(200).json(updatedUser.personalization);
});
```

### Step 3: Modify the Prompt Building Logic

**File:** `api/app/clients/OpenAIClient.js` (and other clients like `GoogleClient.js`, `AnthropicClient.js`)

Locate the `buildMessages` method. Inside this method, you will find where the `instructions` or `promptPrefix` is prepared. You need to modify this section to combine the user's global instructions with the agent's specific instructions.

```javascript
// Inside the buildMessages method of OpenAIClient.js (and other clients)

// ... existing code to get messages and options

// 1. Get the agent's instructions (original logic)
let agentInstructions = this.options.promptPrefix || '';
if (this.options.agent?.instructions) {
  agentInstructions = this.options.agent.instructions;
}

// 2. Get the user's global instructions
const user = this.options.req.user;
const personalization = user.personalization || {};
const { customInstructions, aboutYou } = personalization;

// 3. Combine the instructions
let finalInstructions = agentInstructions;
const userPreamble = aboutYou ? `Here is information about the user:\n${aboutYou}` : '';
const instructionsPreamble = customInstructions ? `Here are the user's custom instructions:\n${customInstructions}` : '';

if (userPreamble || instructionsPreamble) {
  const fullPreamble = `${userPreamble}\n\n${instructionsPreamble}`.trim();
  finalInstructions = `${fullPreamble}\n\n---\n\n${agentInstructions}`;
}

// 4. Use the combined instructions when building the payload
// Replace the original use of `this.options.promptPrefix` or `agent.instructions`
// with `finalInstructions`.

const instructionsPayload = {
  role: 'system',
  content: finalInstructions,
};

// ... continue with the rest of the buildMessages logic, using instructionsPayload
```

### Step 4: Build the Frontend UI

**File:** `client/src/components/Nav/SettingsTabs.tsx` (to add the tab) and a new component for the settings panel.

1.  **Add a "Personalization" Tab:** In `SettingsTabs.tsx`, add a new tab that opens your new personalization component.
2.  **Create the Personalization Component:**
    -   Create a new React component that contains two text areas for "Custom Instructions" and "About You."
    -   Use `react-query` or a similar library to fetch data from `/api/user/personalization` when the component mounts.
    -   On save, use a mutation to call `PUT /api/user/personalization` with the updated values.
