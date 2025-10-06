# Getting Free API Keys for Development - Step-by-Step Guide

**For:** Developers setting up LibreChat/aim2balance.ai for development  
**Last Updated:** 2025-10-05

---

## 📋 Overview

This guide shows you how to get **free API keys** from various AI providers for development and testing. Perfect for learning, prototyping, or small projects.

### What You'll Get

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Google Gemini** | 1,500 requests/day | General development, vision tasks |
| **OpenRouter** | Free models available | Testing multiple models |
| **Groq** | Generous free tier | Fast inference, testing |
| **Anthropic Claude** | $5 free credit | Production-quality responses |

---

## 🎯 Quick Comparison

### Google Gemini (Recommended for Beginners)
- ✅ **Completely free** (no credit card)
- ✅ 1,500 requests per day
- ✅ Access to Gemini 2.5 Pro, Flash, and more
- ✅ Easy setup (5 minutes)
- ❌ Rate limits apply

### OpenRouter (Best for Multiple Models)
- ✅ Access to 100+ models
- ✅ Some models are completely free
- ✅ No credit card for free models
- ✅ Unified API for all providers
- ⚠️ Free models have rate limits

### Groq (Fastest Inference)
- ✅ Very fast responses
- ✅ Generous free tier
- ✅ Llama 3, Mixtral, Gemma models
- ⚠️ Requires credit card for higher limits

---

## 1️⃣ Google Gemini API Key (FREE - No Credit Card)

### Step 1: Sign in to Google AI Studio

1. Go to **[Google AI Studio](https://aistudio.google.com/)**
2. Click **"Get started"** or **"Sign in"**
3. Use your Google account (Gmail, Workspace, etc.)

![Google AI Studio Homepage](https://via.placeholder.com/800x400?text=Google+AI+Studio)

---

### Step 2: Accept Terms of Service

On first visit, you'll see a popup:
- ✅ Check **"I agree to Google APIs Terms of Service"**
- ✅ Check **"I agree to Gemini API Additional Terms of Service"**
- (Optional) Check to receive email updates
- Click **"Continue"**

---

### Step 3: Navigate to API Keys

1. Look for **"Get API key"** button in the top navigation
2. Or click on your profile icon → **"Get API key"**

---

### Step 4: Create API Key

You'll see two options:

**Option A: Create API key in new project**
1. Click **"Create API key in new project"**
2. Google automatically creates a project and generates your key
3. ✅ **Done!** Your key is displayed

**Option B: Create API key in existing project**
1. Click **"Create API key in existing project"**
2. Select a project from the dropdown
3. Click **"Create API key"**
4. ✅ **Done!** Your key is displayed

---

### Step 5: Copy and Save Your API Key

```
Example key: AIzaSyD1234567890abcdefghijklmnopqrstuv
```

**⚠️ Important Security Tips:**
- Copy the key immediately (you can't see it again)
- Store it in a password manager or `.env` file
- **NEVER** commit it to GitHub or share publicly
- Treat it like a password

**Save to `.env` file:**
```bash
GOOGLE_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuv
```

---

### Step 6: Test Your API Key

**Using cURL:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, Gemini!"
      }]
    }]
  }'
```

**Expected Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Hello! How can I help you today?"
      }]
    }
  }]
}
```

✅ If you see a response, your key works!

---

### Gemini Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| **Requests per day** | 1,500 |
| **Requests per minute** | 15 |
| **Models** | All Gemini models (2.5 Pro, 2.5 Flash, 2.0 Flash, etc.) |
| **Context window** | Up to 2M tokens (model dependent) |
| **Cost** | $0.00 |
| **Credit card** | Not required |

**When to upgrade:**
- Need more than 1,500 requests/day
- Building production apps
- Need higher rate limits

---

## 2️⃣ OpenRouter API Key (FREE Models Available)

### Step 1: Sign Up for OpenRouter

1. Go to **[OpenRouter.ai](https://openrouter.ai/)**
2. Click **"Sign In"** in the top right
3. Choose sign-in method:
   - **Google** (recommended)
   - **GitHub**
   - **Email**

---

### Step 2: Create API Key

1. After signing in, click your profile icon
2. Select **"Keys"** from the menu
3. Click **"Create Key"**
4. Give it a name (e.g., "Development Key")
5. Click **"Create"**

---

### Step 3: Copy Your API Key

```
Example key: sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz
```

**Save to `.env` file:**
```bash
OPENROUTER_KEY=sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz
```

---

### Step 4: Add Credits (Optional)

**For Free Models:**
- No credit card needed
- Use models with `:free` suffix

**For Paid Models:**
1. Click **"Credits"** in the menu
2. Click **"Add Credits"**
3. Add $5-$10 to start

---

### Step 5: Test Your API Key

**Using cURL:**
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENROUTER_KEY" \
  -d '{
    "model": "meta-llama/llama-3-8b-instruct:free",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

### Free Models on OpenRouter

| Model | Provider | Speed | Quality |
|-------|----------|-------|---------|
| `meta-llama/llama-3-8b-instruct:free` | Meta | Fast | Good |
| `meta-llama/llama-3.1-8b-instruct:free` | Meta | Fast | Good |
| `google/gemma-2-9b-it:free` | Google | Fast | Good |
| `microsoft/phi-3-mini-128k-instruct:free` | Microsoft | Very Fast | Decent |
| `deepseek/deepseek-r1:free` | DeepSeek | Medium | Excellent |

**How to use in LibreChat:**

**librechat.yaml:**
```yaml
endpoints:
  custom:
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default:
          - 'meta-llama/llama-3-8b-instruct:free'
          - 'meta-llama/llama-3.1-8b-instruct:free'
          - 'google/gemma-2-9b-it:free'
          - 'deepseek/deepseek-r1:free'
        fetch: false
      titleConvo: true
      titleModel: 'meta-llama/llama-3-8b-instruct:free'
      dropParams: ['stop']
      modelDisplayLabel: 'OpenRouter (Free)'
```

---

## 3️⃣ Groq API Key (FREE Tier)

### Step 1: Sign Up for Groq

1. Go to **[console.groq.com](https://console.groq.com/)**
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - **Google** (recommended)
   - **GitHub**
   - **Email**

---

### Step 2: Create API Key

1. After signing in, go to **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Give it a name (e.g., "Development")
4. Click **"Submit"**

---

### Step 3: Copy Your API Key

```
Example key: gsk_1234567890abcdefghijklmnopqrstuvwxyz
```

**Save to `.env` file:**
```bash
GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuvwxyz
```

---

### Step 4: Test Your API Key

**Using cURL:**
```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY" \
  -d '{
    "model": "llama3-8b-8192",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

### Groq Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| **Requests per day** | 14,400 |
| **Requests per minute** | 30 |
| **Tokens per minute** | 7,000 |
| **Models** | Llama 3, Mixtral, Gemma |
| **Speed** | ⚡ Very fast (optimized hardware) |

**Available Models:**
- `llama3-70b-8192` - Best quality
- `llama3-8b-8192` - Fast and good
- `mixtral-8x7b-32768` - Large context window
- `gemma-7b-it` - Lightweight

---

## 4️⃣ Anthropic Claude API Key ($5 Free Credit)

### Step 1: Sign Up for Anthropic

1. Go to **[console.anthropic.com](https://console.anthropic.com/)**
2. Click **"Sign Up"**
3. Enter your email and create a password
4. Verify your email

---

### Step 2: Add Payment Method

⚠️ **Credit card required** (but you get $5 free credit)

1. Go to **"Billing"** in the left sidebar
2. Click **"Add Payment Method"**
3. Enter your credit card details
4. You'll receive **$5 in free credits** automatically

---

### Step 3: Create API Key

1. Go to **"API Keys"** in the left sidebar
2. Click **"Create Key"**
3. Give it a name (e.g., "Development")
4. Click **"Create Key"**

---

### Step 4: Copy Your API Key

```
Example key: sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz
```

**Save to `.env` file:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz
```

---

### Step 5: Test Your API Key

**Using cURL:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

### Claude Pricing (After Free Credit)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Claude 3.5 Haiku | $0.80 | $4.00 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Opus | $15.00 | $75.00 |

**$5 free credit = approximately:**
- 6M tokens with Haiku
- 1.6M tokens with Sonnet
- 300K tokens with Opus

---

## 🔧 Configure LibreChat with Your API Keys

### Step 1: Create `.env` File

In your LibreChat root directory, create `.env`:

```bash
# Copy from .env.example
cp .env.example .env
```

---

### Step 2: Add Your API Keys

Edit `.env` and add your keys:

```bash
# Google Gemini
GOOGLE_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuv

# OpenRouter
OPENROUTER_KEY=sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz

# Groq
GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuvwxyz

# Anthropic Claude (optional)
ANTHROPIC_API_KEY=sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz

# OpenAI (if you have it)
OPENAI_API_KEY=sk-1234567890abcdefghijklmnopqrstuvwxyz
```

---

### Step 3: Configure `librechat.yaml`

Create or edit `librechat.yaml`:

```yaml
version: 1.2.1
cache: true

endpoints:
  custom:
    # Groq - Fast and Free
    - name: 'Groq'
      apiKey: '${GROQ_API_KEY}'
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default:
          - 'llama3-70b-8192'
          - 'llama3-8b-8192'
          - 'mixtral-8x7b-32768'
          - 'gemma-7b-it'
        fetch: false
      titleConvo: true
      titleModel: 'mixtral-8x7b-32768'
      modelDisplayLabel: 'Groq'

    # OpenRouter - Multiple Free Models
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default:
          - 'meta-llama/llama-3-8b-instruct:free'
          - 'meta-llama/llama-3.1-8b-instruct:free'
          - 'google/gemma-2-9b-it:free'
          - 'deepseek/deepseek-r1:free'
        fetch: false
      titleConvo: true
      titleModel: 'meta-llama/llama-3-8b-instruct:free'
      dropParams: ['stop']
      modelDisplayLabel: 'OpenRouter (Free)'
```

---

### Step 4: Start LibreChat

```bash
# If using Docker
docker-compose up -d

# If using npm
npm run backend
npm run frontend
```

---

### Step 5: Test in UI

1. Open http://localhost:3080
2. Register/login
3. Select an endpoint (Groq, OpenRouter, Google)
4. Send a test message
5. ✅ You should get a response!

---

## 💡 Best Practices

### 1. Secure Your API Keys

**❌ DON'T:**
```javascript
// NEVER hardcode keys in code
const apiKey = "AIzaSyD1234567890abcdefghijklmnopqrstuv";
```

**✅ DO:**
```javascript
// Use environment variables
const apiKey = process.env.GOOGLE_KEY;
```

---

### 2. Add `.env` to `.gitignore`

```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

### 3. Use Different Keys for Dev/Prod

```bash
# .env.development
GOOGLE_KEY=AIzaSyD_dev_key_here

# .env.production
GOOGLE_KEY=AIzaSyD_prod_key_here
```

---

### 4. Monitor Your Usage

**Google Gemini:**
- Check usage at [Google AI Studio](https://aistudio.google.com/)
- View quota limits and requests

**OpenRouter:**
- Check usage at [OpenRouter Dashboard](https://openrouter.ai/activity)
- Monitor credits and spending

**Groq:**
- Check usage at [Groq Console](https://console.groq.com/usage)
- View rate limit status

---

### 5. Set Up API Key Restrictions

**Google Gemini:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Add restrictions:
   - **Application restrictions:** HTTP referrers or IP addresses
   - **API restrictions:** Only allow Generative Language API

**Example IP restriction:**
```
# Only allow from your server
123.456.789.0
```

---

## 🚨 Troubleshooting

### Error: "API key not valid"

**Solution:**
1. Check if you copied the full key (no spaces)
2. Verify the key is active in the provider's dashboard
3. Check if you're using the correct environment variable name

---

### Error: "Rate limit exceeded"

**Solution:**
1. Wait a few minutes and try again
2. Check your usage in the provider's dashboard
3. Consider upgrading to a paid plan
4. Use a different provider temporarily

---

### Error: "Insufficient credits"

**Solution (OpenRouter):**
1. Add credits to your account
2. Use free models (with `:free` suffix)

**Solution (Anthropic):**
1. Check your billing dashboard
2. Add a payment method if needed

---

### Error: "Model not found"

**Solution:**
1. Check the model name is correct
2. Verify the model is available in your region
3. Try `fetch: true` in librechat.yaml to auto-discover models

---

## 📊 Cost Comparison

### For 1 Million Tokens (Input + Output)

| Provider | Model | Cost | Free Tier |
|----------|-------|------|-----------|
| **Google Gemini** | Gemini 2.0 Flash | $0.00 | ✅ 1,500 req/day |
| **OpenRouter** | Llama 3 8B (free) | $0.00 | ✅ With limits |
| **Groq** | Llama 3 8B | $0.00 | ✅ 14,400 req/day |
| **Anthropic** | Claude 3.5 Haiku | $2.40 | $5 free credit |
| **OpenAI** | GPT-4o Mini | $0.75 | $5 free credit (new accounts) |

**Recommendation for Development:**
1. **Start with Google Gemini** (easiest, no credit card)
2. **Add Groq** for fast responses
3. **Add OpenRouter** for model variety
4. **Add Anthropic** if you need Claude

---

## 🔗 Related Documentation

- [Configuration Guide](./configuration_guide.md) - Complete configuration reference
- [Balance & Credits System](./balance_credits_explained.md) - How credits work
- [Official LibreChat Docs](https://www.librechat.ai/docs)

---

## 📚 Additional Resources

### Provider Documentation
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com/)

### Community
- [LibreChat Discord](https://discord.librechat.ai)
- [LibreChat GitHub](https://github.com/danny-avila/LibreChat)
- [LibreChat Discussions](https://github.com/danny-avila/LibreChat/discussions)

---

**Document Status:** Complete  
**Last Updated:** 2025-10-05  
**Author:** Cascade AI Assistant

**Quick Links:**
- 🔑 [Get Gemini API Key](https://aistudio.google.com/)
- 🔑 [Get OpenRouter API Key](https://openrouter.ai/)
- 🔑 [Get Groq API Key](https://console.groq.com/)
- 🔑 [Get Anthropic API Key](https://console.anthropic.com/)
