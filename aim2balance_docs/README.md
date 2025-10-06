# aim2balance.ai Documentation

**One-liner:** EU-hosted multi-model AI chat with EUR-based billing and environmental impact tracking.

---

## 🚀 Quick Start

**New to the project?** Start here:

2. **[EUR Implementation](./implementation/EUR_IMPLEMENTATION.md)** - EUR cost tracking details
3. **[Configuration Guide](./guides/configuration_guide.md)** - Setup instructions
4. **[Getting API Keys](./guides/getting_free_api_keys.md)** - Free API keys for testing

---

## 📋 What's Been Implemented

### ✅ EUR Cost Tracking System

- Primary currency: EUR (not USD)
- Dual currency display (EUR + USD)
- Provider markup (+15%)
- Environmental rebalancing fee (+2.5%)
- Real-time exchange rates

**See:** [EUR_IMPLEMENTATION.md](./implementation/EUR_IMPLEMENTATION.md)

### ✅ Smart Endpoint Filtering

- Only show AI providers with configured API keys
- Hide user API key settings
- Clean, focused interface

**See:** [ENDPOINT_FILTERING.md](./implementation/ENDPOINT_FILTERING.md)

---

## 📁 Documentation Structure

```
aim2balance_docs/
├── README.md (this file)
│
├── implementation/          ⭐ Implementation Guides
│   ├── MVP_IMPLEMENTATION.md       - Complete MVP guide
│   ├── EUR_IMPLEMENTATION.md       - EUR cost tracking
│   └── ENDPOINT_FILTERING.md       - Endpoint filtering
│
├── guides/                  📖 Setup & Configuration
│   ├── configuration_guide.md      - Complete config reference
│   ├── getting_free_api_keys.md    - Get API keys
│   ├── social_logins_setup.md      - Social auth setup
│   └── email_and_notifications_setup.md - Email config
│
├── analysis/                📊 Analysis & Planning
│   ├── gap2_eur_cost_tracking_analysis.md - EUR analysis
│   ├── balance_credits_explained.md - Balance system
│   ├── task_usage_balance_ui.md    - Usage/balance mapping
│   ├── aim2balance_concept.md      - Project vision
│   ├── features_summary.md         - Feature overview
│   └── dashboard_concept.md        - Dashboard design
│
├── reference/               📚 LibreChat Reference
│   ├── architecture_and_data_flow.md - System architecture
│   ├── backend_deep_dive.md        - Backend components
│   ├── frontend_deep_dive.md       - Frontend components
│   ├── authentication_flow.md      - Authentication
│   ├── token_usage_analysis.md     - Token tracking
│   ├── agents_and_tools_analysis.md - Agents framework
│   └── rag_and_vector_stores_analysis.md - RAG system
│
└── archive/                 🗂️ Old/Superseded Docs
    └── (21 archived files)
```

---

## 🎯 Implementation Status

### ✅ Completed Features

- **EUR Cost Tracking** - All costs in EUR with USD display
- **Balance Display** - Dual currency in UI
- **Endpoint Filtering** - Only show configured providers
- **Exchange Rates** - Real-time with 24h caching
- **Provider Markup** - +15% configurable
- **Rebalancing Fee** - +2.5% for environmental contribution

### ⏳ Planned Features

- **Impact Pipeline** - Track energy/water/CO₂ usage
- **Dashboard** - Usage metrics and sustainability tracking
- **Rebalancing Flow** - Automatic Bergwaldprojekt donations

---

## 📖 Quick Links

### For Developers

- **[MVP Guide](./implementation/MVP_IMPLEMENTATION.md)** - Complete implementation overview
- **[EUR Implementation](./implementation/EUR_IMPLEMENTATION.md)** - EUR cost tracking details
- **[Endpoint Filtering](./implementation/ENDPOINT_FILTERING.md)** - Provider filtering

### For Setup

- **[Configuration](./guides/configuration_guide.md)** - Complete config reference
- **[API Keys](./guides/getting_free_api_keys.md)** - Get free API keys
- **[Social Logins](./guides/social_logins_setup.md)** - Setup OAuth
- **[Email Setup](./guides/email_and_notifications_setup.md)** - Configure emails

### For Analysis

- **[EUR Analysis](./analysis/gap2_eur_cost_tracking_analysis.md)** - Original EUR analysis
- **[Balance System](./analysis/balance_credits_explained.md)** - How balance works
- **[Project Vision](./analysis/aim2balance_concept.md)** - Project goals
- **[Dashboard Concept](./analysis/dashboard_concept.md)** - Dashboard design

### For Reference

- **[Architecture](./reference/architecture_and_data_flow.md)** - System architecture
- **[Backend](./reference/backend_deep_dive.md)** - Backend components
- **[Frontend](./reference/frontend_deep_dive.md)** - Frontend components
- **[Authentication](./reference/authentication_flow.md)** - Auth flow
- **[Agents](./reference/agents_and_tools_analysis.md)** - Agents framework

---

## 🚀 Getting Started

1. **Read:** [implementation/MVP_IMPLEMENTATION.md](./implementation/MVP_IMPLEMENTATION.md)
2. **Configure:** Follow [guides/configuration_guide.md](./guides/configuration_guide.md)
3. **Get API Keys:** Use [guides/getting_free_api_keys.md](./guides/getting_free_api_keys.md)
4. **Test:** Follow testing guide in MVP_IMPLEMENTATION.md

---

**Last Updated:** 2025-10-06  
**Status:** ✅ Organized & Ready for Development
