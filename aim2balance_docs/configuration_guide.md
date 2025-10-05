# LibreChat Configuration Guide - Complete Reference

**For:** Developers setting up LibreChat/aim2balance.ai  
**Last Updated:** 2025-10-05

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Environment Variables (.env)](#environment-variables-env)
3. [YAML Configuration (librechat.yaml)](#yaml-configuration-librechatyaml)
4. [Quick Start Configuration](#quick-start-configuration)
5. [Common Configuration Scenarios](#common-configuration-scenarios)

---

## Overview

LibreChat uses **two configuration files**:

1. **`.env`** - Environment variables for sensitive data (API keys, database URLs, secrets)
2. **`librechat.yaml`** - Application configuration (UI settings, endpoints, features)

**Simple Explanation:**
- `.env` = Secrets and server settings (like passwords)
- `librechat.yaml` = App behavior and features (like which AI models to show)

---

## Environment Variables (.env)

### 🔧 Server Configuration

#### **HOST & PORT**
```bash
HOST=localhost
PORT=3080
```
**Simple:** Where your app runs  
**Detailed:** `HOST` is the network interface (use `0.0.0.0` for Docker), `PORT` is the HTTP port

---

#### **MONGO_URI**
```bash
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
```
**Simple:** Database connection string  
**Detailed:** MongoDB connection URL. Format: `mongodb://[username:password@]host:port/database`

**Advanced Options:**
```bash
MONGO_MAX_POOL_SIZE=10          # Max simultaneous connections
MONGO_MIN_POOL_SIZE=2           # Min connections to keep open
MONGO_MAX_IDLE_TIME_MS=60000    # Close idle connections after 60s
MONGO_AUTO_INDEX=true           # Auto-create database indexes
```

---

#### **DOMAIN_CLIENT & DOMAIN_SERVER**
```bash
DOMAIN_CLIENT=http://localhost:3080
DOMAIN_SERVER=http://localhost:3080
```
**Simple:** Your website URL  
**Detailed:** Used for OAuth callbacks, email links, and CORS. Change to your production domain (e.g., `https://chat.yourdomain.com`)

---

#### **TRUST_PROXY**
```bash
TRUST_PROXY=1
```
**Simple:** How many reverse proxies are in front of your app  
**Detailed:** Set to `1` if behind nginx/Apache, `0` if directly exposed. Affects IP address detection for rate limiting.

---

### 🔐 Security & Authentication

#### **JWT Secrets**
```bash
JWT_SECRET=16f8c0ef4a5d391b26034086c628469d3f9f497f08163ab9b40137092f2909ef
JWT_REFRESH_SECRET=eaa5191f2914e30b9387fd84e254e4ba6fc51b4654968a9b0803b456a54b8418
```
**Simple:** Secret keys for user sessions  
**Detailed:** Used to sign authentication tokens. **MUST be changed in production!** Generate with:
```bash
openssl rand -hex 32
```

---

#### **Session Expiry**
```bash
SESSION_EXPIRY=1000 * 60 * 15              # 15 minutes
REFRESH_TOKEN_EXPIRY=(1000 * 60 * 60 * 24) * 7  # 7 days
```
**Simple:** How long users stay logged in  
**Detailed:** `SESSION_EXPIRY` is the active session timeout. `REFRESH_TOKEN_EXPIRY` allows "remember me" functionality.

---

#### **Password Requirements**
```bash
MIN_PASSWORD_LENGTH=8
```
**Simple:** Minimum password length  
**Detailed:** Set to `1` if using LDAP (LDAP handles password rules)

---

### 🤖 AI Provider API Keys

#### **OpenAI**
```bash
OPENAI_API_KEY=user_provided
# OPENAI_MODELS=gpt-4o,gpt-4o-mini,gpt-3.5-turbo
# OPENAI_REVERSE_PROXY=https://your-proxy.com
```
**Simple:** Your OpenAI API key  
**Detailed:** 
- `user_provided` = Users enter their own keys in UI
- Set actual key = All users share this key
- `OPENAI_MODELS` = Comma-separated list of models to show
- `OPENAI_REVERSE_PROXY` = Use a proxy/gateway (for cost control)

---

#### **Google Gemini**
```bash
GOOGLE_KEY=user_provided
# GOOGLE_MODELS=gemini-2.5-pro,gemini-2.5-flash,gemini-2.0-flash
```
**Simple:** Your Google AI Studio API key  
**Detailed:** Free tier available at https://aistudio.google.com

---

#### **Anthropic Claude**
```bash
ANTHROPIC_API_KEY=user_provided
# ANTHROPIC_MODELS=claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022
```
**Simple:** Your Anthropic API key  
**Detailed:** Get from https://console.anthropic.com

---

#### **Custom Endpoints (via librechat.yaml)**
```bash
GROQ_API_KEY=your_key_here
MISTRAL_API_KEY=your_key_here
OPENROUTER_KEY=your_key_here
```
**Simple:** API keys for other providers  
**Detailed:** These are referenced in `librechat.yaml` using `${GROQ_API_KEY}` syntax

---

### 👥 User Registration & Login

#### **Registration Settings**
```bash
ALLOW_EMAIL_LOGIN=true
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=false
ALLOW_SOCIAL_REGISTRATION=false
ALLOW_PASSWORD_RESET=false
ALLOW_UNVERIFIED_EMAIL_LOGIN=true
```
**Simple:** Who can sign up and how  
**Detailed:**
- `ALLOW_EMAIL_LOGIN=true` → Users can log in with email/password
- `ALLOW_REGISTRATION=true` → Anyone can create an account
- `ALLOW_SOCIAL_LOGIN=true` → Enable Google/GitHub/Discord login
- `ALLOW_UNVERIFIED_EMAIL_LOGIN=true` → Users don't need to verify email (dev only!)

---

#### **Social Login Providers**

**Google OAuth:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=/oauth/google/callback
```

**GitHub OAuth:**
```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=/oauth/github/callback
```

**Discord OAuth:**
```bash
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_CALLBACK_URL=/oauth/discord/callback
```

**Simple:** Enable "Login with Google/GitHub/Discord"  
**Detailed:** You need to create OAuth apps in each provider's developer console

---

### 💰 Balance & Credits System

```bash
# CHECK_BALANCE=false
# START_BALANCE=20000
```
**Simple:** Give users credits to use AI models  
**Detailed:** 
- `CHECK_BALANCE=true` → Enable credit system
- `START_BALANCE=20000` → New users get 20,000 credits ($0.02 USD)
- See `librechat.yaml` for more balance options

**Note:** This is configured in `librechat.yaml` now (see below)

---

### 🔍 Search (MeiliSearch)

```bash
SEARCH=true
MEILI_HOST=http://0.0.0.0:7700
MEILI_MASTER_KEY=DrhYf7zENyR6AlUCKmnz0eYASOQdl6zxH7s7MKFSfFCt
MEILI_NO_ANALYTICS=true
```
**Simple:** Enable chat history search  
**Detailed:** MeiliSearch indexes your conversations for fast search. **Change the master key in production!**

---

### 🛡️ Rate Limiting & Moderation

#### **Rate Limits**
```bash
LOGIN_MAX=7                    # Max login attempts
LOGIN_WINDOW=5                 # Within 5 minutes

REGISTER_MAX=5                 # Max registrations
REGISTER_WINDOW=60             # Within 60 minutes

LIMIT_CONCURRENT_MESSAGES=true
CONCURRENT_MESSAGE_MAX=2       # Max 2 messages at once per user

MESSAGE_IP_MAX=40              # Max 40 messages per IP
MESSAGE_IP_WINDOW=1            # Per 1 minute
```
**Simple:** Prevent abuse  
**Detailed:** Limits how many requests users can make. Adjust based on your user base.

---

#### **Ban System**
```bash
BAN_VIOLATIONS=true
BAN_DURATION=1000 * 60 * 60 * 2  # 2 hours
BAN_INTERVAL=20                   # Ban after 20 violations

LOGIN_VIOLATION_SCORE=1
REGISTRATION_VIOLATION_SCORE=1
MESSAGE_VIOLATION_SCORE=1
NON_BROWSER_VIOLATION_SCORE=20
```
**Simple:** Auto-ban abusive users  
**Detailed:** Each violation adds points. Reach `BAN_INTERVAL` points = banned for `BAN_DURATION`.

---

### 📧 Email Configuration

#### **SMTP (Generic Email)**
```bash
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_ENCRYPTION=starttls
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LibreChat
```
**Simple:** Send password reset emails  
**Detailed:** Use Gmail, Outlook, or any SMTP server. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

---

#### **Mailgun (Recommended for Production)**
```bash
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LibreChat
```
**Simple:** Professional email service  
**Detailed:** Mailgun is more reliable than SMTP. Free tier: 5,000 emails/month.

---

### 📁 File Storage

#### **Local Storage (Default)**
No configuration needed. Files stored in `./uploads/`

#### **AWS S3**
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=librechat-files
```
**Simple:** Store files in Amazon S3  
**Detailed:** Recommended for production. Supports any S3-compatible service (DigitalOcean Spaces, Backblaze B2, etc.)

---

#### **Firebase Storage**
```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```
**Simple:** Store files in Google Firebase  
**Detailed:** Good for small projects. Free tier: 5GB storage, 1GB/day downloads.

---

### 🎨 UI Customization

```bash
APP_TITLE=LibreChat
# CUSTOM_FOOTER="Powered by aim2balance.ai"
HELP_AND_FAQ_URL=https://librechat.ai
# SHOW_BIRTHDAY_ICON=true
```
**Simple:** Customize branding  
**Detailed:** Change app title, footer text, and help link

---

### 🐛 Debugging

```bash
DEBUG_LOGGING=true
DEBUG_CONSOLE=false
CONSOLE_JSON=false
DEBUG_OPENAI=false
DEBUG_PLUGINS=true
```
**Simple:** Enable detailed logs  
**Detailed:**
- `DEBUG_LOGGING=true` → Save debug logs to `./logs/debug-YYYY-MM-DD.log`
- `DEBUG_CONSOLE=true` → Print logs to console
- `CONSOLE_JSON=true` → JSON format (for cloud logging)

---

## YAML Configuration (librechat.yaml)

### 📌 Version & Cache

```yaml
version: 1.2.1
cache: true
```
**Simple:** Config file version and enable caching  
**Detailed:** `cache: true` caches AI responses for faster repeated queries

---

### 🎨 Interface Configuration

```yaml
interface:
  customWelcome: 'Welcome to aim2balance.ai!'
  
  privacyPolicy:
    externalUrl: 'https://yourdomain.com/privacy'
    openNewTab: true
  
  termsOfService:
    externalUrl: 'https://yourdomain.com/tos'
    openNewTab: true
    modalAcceptance: true  # Force users to accept on first login
  
  endpointsMenu: true      # Show AI provider selector
  modelSelect: true        # Show model dropdown
  parameters: true         # Show temperature/top-p sliders
  sidePanel: true          # Show conversation history sidebar
  presets: true            # Allow saving prompt templates
  prompts: true            # Show prompt library
  bookmarks: true          # Allow bookmarking conversations
  multiConvo: true         # Allow multiple conversations at once
  agents: true             # Enable AI agents feature
  fileCitations: true      # Show sources in responses
```

**Simple:** Control which UI features are visible  
**Detailed:** Set to `false` to hide features you don't want users to access

---

### 👥 Registration

```yaml
registration:
  socialLogins: ['github', 'google', 'discord']
  # allowedDomains:
  #   - "yourcompany.com"  # Only allow company emails
```

**Simple:** Control who can register  
**Detailed:** `allowedDomains` restricts registration to specific email domains (e.g., only `@yourcompany.com`)

---

### 💰 Balance & Credits

```yaml
balance:
  enabled: true
  startBalance: 10000000      # $10 USD = 10M credits
  autoRefillEnabled: true
  refillIntervalValue: 30
  refillIntervalUnit: 'days'
  refillAmount: 5000000       # Add $5 every 30 days
```

**Simple:** Give users a monthly credit allowance  
**Detailed:**
- `startBalance: 10000000` → New users get $10 worth of credits
- `autoRefillEnabled: true` → Automatically add credits every month
- `refillAmount: 5000000` → Add $5 every 30 days

**Credit Conversion:**
- 1,000,000 credits = $1.00 USD
- 10,000,000 credits = $10.00 USD

---

### 📊 Transactions

```yaml
transactions:
  enabled: true  # Save token usage to database
```

**Simple:** Track AI usage  
**Detailed:** Creates a `Transaction` record for every AI request. Required if `balance.enabled = true`.

---

### 🚦 Rate Limits

```yaml
rateLimits:
  fileUploads:
    ipMax: 100                  # Max 100 uploads per IP
    ipWindowInMinutes: 60       # Per hour
    userMax: 50                 # Max 50 uploads per user
    userWindowInMinutes: 60     # Per hour
  
  conversationsImport:
    ipMax: 100
    ipWindowInMinutes: 60
    userMax: 50
    userWindowInMinutes: 60
```

**Simple:** Prevent file upload abuse  
**Detailed:** Limits uploads per IP and per user. Adjust based on your needs.

---

### 🤖 AI Endpoints Configuration

#### **Custom Endpoint Example: Groq**

```yaml
endpoints:
  custom:
    - name: 'groq'
      apiKey: '${GROQ_API_KEY}'
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default:
          - 'llama3-70b-8192'
          - 'llama3-8b-8192'
          - 'mixtral-8x7b-32768'
        fetch: false  # Don't auto-fetch models from API
      titleConvo: true
      titleModel: 'mixtral-8x7b-32768'
      modelDisplayLabel: 'Groq'
```

**Simple:** Add Groq AI models  
**Detailed:**
- `apiKey: '${GROQ_API_KEY}'` → References `.env` variable
- `baseURL` → API endpoint
- `models.default` → List of models to show
- `fetch: false` → Use hardcoded model list (faster)
- `titleConvo: true` → Auto-generate conversation titles
- `titleModel` → Which model to use for titles

---

#### **OpenRouter Example**

```yaml
- name: 'OpenRouter'
  apiKey: '${OPENROUTER_KEY}'
  baseURL: 'https://openrouter.ai/api/v1'
  models:
    default: ['meta-llama/llama-3-70b-instruct']
    fetch: true  # Auto-fetch available models
  titleConvo: true
  titleModel: 'meta-llama/llama-3-70b-instruct'
  dropParams: ['stop']  # Remove 'stop' parameter (OpenRouter doesn't support it)
  modelDisplayLabel: 'OpenRouter'
```

**Simple:** Add OpenRouter (access to 100+ models)  
**Detailed:**
- `fetch: true` → Automatically discover available models
- `dropParams: ['stop']` → Remove unsupported parameters

---

#### **Mistral AI Example**

```yaml
- name: 'Mistral'
  apiKey: '${MISTRAL_API_KEY}'
  baseURL: 'https://api.mistral.ai/v1'
  models:
    default: ['mistral-tiny', 'mistral-small', 'mistral-medium']
    fetch: true
  titleConvo: true
  titleModel: 'mistral-tiny'
  modelDisplayLabel: 'Mistral'
  dropParams: ['stop', 'user', 'frequency_penalty', 'presence_penalty']
```

**Simple:** Add Mistral AI models  
**Detailed:** Mistral requires dropping several OpenAI-specific parameters to avoid 422 errors

---

### 📁 File Upload Configuration

```yaml
fileConfig:
  endpoints:
    assistants:
      fileLimit: 5              # Max 5 files per request
      fileSizeLimit: 10         # Max 10 MB per file
      totalSizeLimit: 50        # Max 50 MB total
      supportedMimeTypes:
        - "image/.*"
        - "application/pdf"
    
    openAI:
      disabled: true            # Disable file uploads for OpenAI
    
    default:
      totalSizeLimit: 20        # Default 20 MB limit
  
  serverFileSizeLimit: 100      # Global max file size
  avatarSizeLimit: 2            # Max 2 MB for avatars
```

**Simple:** Control file upload limits  
**Detailed:** Set different limits per endpoint. Use regex for `supportedMimeTypes`.

---

### 🔍 Web Search Configuration

```yaml
webSearch:
  # Search provider
  serperApiKey: '${SERPER_API_KEY}'
  
  # Content scraper
  firecrawlApiKey: '${FIRECRAWL_API_KEY}'
  
  # Reranker (improves search results)
  jinaApiKey: '${JINA_API_KEY}'
  # or
  cohereApiKey: '${COHERE_API_KEY}'
```

**Simple:** Enable web search in chats  
**Detailed:** Requires 3 services:
1. **Search provider** (Serper) - Finds web pages
2. **Scraper** (Firecrawl) - Extracts content
3. **Reranker** (Jina/Cohere) - Ranks results by relevance

---

### 🧠 Memory Configuration

```yaml
memory:
  disabled: false
  validKeys: ["preferences", "work_info", "personal_info", "skills"]
  tokenLimit: 10000
  personalize: true
  agent:
    id: "your-memory-agent-id"
```

**Simple:** AI remembers user preferences  
**Detailed:** Stores user information across conversations. `validKeys` limits what can be stored.

---

## Quick Start Configuration

### Minimal Setup (Development)

**.env:**
```bash
# Server
HOST=localhost
PORT=3080
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
DOMAIN_CLIENT=http://localhost:3080
DOMAIN_SERVER=http://localhost:3080

# Auth (CHANGE THESE!)
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Registration
ALLOW_EMAIL_LOGIN=true
ALLOW_REGISTRATION=true
ALLOW_UNVERIFIED_EMAIL_LOGIN=true

# AI Providers (use user_provided or your keys)
OPENAI_API_KEY=user_provided
GOOGLE_KEY=user_provided
ANTHROPIC_API_KEY=user_provided

# Search
SEARCH=true
MEILI_HOST=http://0.0.0.0:7700
MEILI_MASTER_KEY=change-me-in-production

# Debugging
DEBUG_LOGGING=true
```

**librechat.yaml:**
```yaml
version: 1.2.1
cache: true

interface:
  customWelcome: 'Welcome to LibreChat!'
  endpointsMenu: true
  modelSelect: true

registration:
  socialLogins: []

balance:
  enabled: false  # Disable for development

endpoints:
  # Add custom endpoints here if needed
```

---

## Common Configuration Scenarios

### Scenario 1: Corporate Internal Deployment

**Requirements:**
- Only company emails can register
- Users share a company OpenAI key
- No social logins
- Email verification required

**.env:**
```bash
ALLOW_EMAIL_LOGIN=true
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=false
ALLOW_UNVERIFIED_EMAIL_LOGIN=false

OPENAI_API_KEY=sk-your-company-key-here

# Email setup (required for verification)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=noreply@yourcompany.com
EMAIL_PASSWORD=your-app-password
```

**librechat.yaml:**
```yaml
registration:
  socialLogins: []
  allowedDomains:
    - "yourcompany.com"
```

---

### Scenario 2: Public SaaS with Credits

**Requirements:**
- Anyone can register
- Users get $10 free credits
- Auto-refill $5/month
- Multiple AI providers

**.env:**
```bash
ALLOW_EMAIL_LOGIN=true
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=true

GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret

OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GROQ_API_KEY=your-groq-key
```

**librechat.yaml:**
```yaml
registration:
  socialLogins: ['google', 'github']

balance:
  enabled: true
  startBalance: 10000000      # $10
  autoRefillEnabled: true
  refillIntervalValue: 30
  refillIntervalUnit: 'days'
  refillAmount: 5000000       # $5/month

transactions:
  enabled: true

endpoints:
  custom:
    - name: 'groq'
      apiKey: '${GROQ_API_KEY}'
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default: ['llama3-70b-8192']
```

---

### Scenario 3: Development with Free APIs

**Requirements:**
- Use free AI providers
- No user registration
- Single admin user

**.env:**
```bash
ALLOW_REGISTRATION=false
ALLOW_EMAIL_LOGIN=true

# Use OpenRouter for free models
OPENROUTER_KEY=your-openrouter-key

# Or use Groq (free tier)
GROQ_API_KEY=your-groq-key
```

**librechat.yaml:**
```yaml
endpoints:
  custom:
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['meta-llama/llama-3-8b-instruct:free']
        fetch: true
```

---

## 🔗 Related Documentation

- [Getting Free API Keys for Development](./getting_free_api_keys.md)
- [Balance & Credits System Explained](./balance_credits_explained.md)
- [Gap 2: EUR Cost Tracking Analysis](./gap2_eur_cost_tracking_analysis.md)

---

**Document Status:** Complete  
**Last Updated:** 2025-10-05  
**Author:** Cascade AI Assistant
