# openclaw-crm

**A modular, privacy-first CRM platform with deep integration for OpenClaw — the self-hosted multi-channel AI agent gateway.**

Your AI agents can now manage customers, deals, follow-ups, and communications conversationally across Slack, WhatsApp, Discord, Teams, Telegram, and more — while keeping all data under your control.

Built for practical SMB and professional services use cases (law firms, construction, accounting, clinics) with measurable time savings and full data sovereignty.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why This Project?

Traditional CRMs are either:
- Bloated SaaS with data lock-in and privacy concerns
- Rigid on-prem systems that don't speak the language of modern AI agents

**openclaw-crm** is different:
- **Modular by design**: Add or extend only the capabilities you need (Contacts, Pipeline, Activities, Comms, Analytics). Each module is self-contained.
- **OpenClaw-native**: Exposes rich, typed tools for agents. Agents gain CRM superpowers without leaving the chat apps your customers already use.
- **Privacy-first & self-hostable**: Full export/delete, encryption options, local-first modes, no vendor training on your data. Aligns with confidential computing and on-prem preferences.
- **Multi-channel engagement**: Leverage OpenClaw's gateway so one agent instance handles intake, follow-up, and support across every channel.
- **Extensible for builders**: Clean architecture + plugin-friendly patterns. Easy to add custom modules, custom AI skills, or integrate with your existing Neuron/Kanga/ANimus workflows.

## Key Features (Planned / In Progress)

- **Core CRM Modules**
  - Contacts & Companies (with custom fields, relationships, tags)
  - Deals & Pipelines (kanban + list, stage automation)
  - Activities, Tasks & Notes (timeline, reminders, AI-suggested next steps)
  - Communications Hub (threaded history synced from OpenClaw channels)
  - Reporting & Insights (pipeline velocity, AI-generated summaries, cohort analysis)

- **OpenClaw Integration**
  - Agent tool-calling API (search, create, update, summarize entities)
  - Session & memory bridging (CRM context injected into OpenClaw sessions)
  - Event-driven sync (CRM changes → OpenClaw notifications / agent triggers)
  - Multi-channel orchestration (agent initiates outreach or responds in customer's preferred app)
  - Example skill/bridge implementation

- **Platform**
  - Modern Next.js full-stack UI (dashboard, role-based views, mobile-friendly)
  - PostgreSQL (prod) + SQLite (dev/local) via Drizzle ORM
  - RBAC + audit logging + data portability (GDPR/CCPA ready patterns)
  - Docker + docker-compose for one-command self-hosting (with optional OpenClaw sidecar)
  - Extensible module registry

## Architecture

See [docs/architecture.md](./docs/architecture.md) for detailed diagrams and module boundaries.

High-level:
```
Chat Apps (via OpenClaw Gateway)
        ↓
OpenClaw Agents (tool use + memory + sessions)
        ↓
openclaw-crm Tool API / Bridge  ↔  Core CRM Modules (modular, registry-driven)
        ↓
Database + Auth + Audit
        ↓
Web Dashboard (Next.js) + Admin / Reporting
```

**Module boundaries are strict** — each module owns its domain, API surface, migrations, and UI slices. Cross-module communication goes through well-defined events or the core service layer.

## OpenClaw Integration Details

See [docs/openclaw-integration.md](./docs/openclaw-integration.md) for:
- How to register CRM tools with OpenClaw agents
- Example tool schemas (JSON Schema / function calling)
- Session memory mapping strategy
- Webhook and event patterns
- Running the CRM alongside the OpenClaw Gateway
- Reference bridge implementation (Node/TypeScript)

Quick conceptual example (agent perspective):
- "Show me the top 3 deals closing this month for Acme Corp"
- Agent calls `crm.search_deals({company: "Acme Corp", stage: "negotiation", limit: 3})`
- Agent calls `crm.summarize_pipeline()` or `crm.log_activity(...)`
- All happens inside the customer's Slack thread or WhatsApp chat via OpenClaw.

## Getting Started (Developer Preview)

> **Note**: This is an early skeleton. Core modules and full OpenClaw tool bridge are under active development.

### Prerequisites
- Node.js 22+ / 24+
- Docker & Docker Compose (recommended for DB + full stack)
- A running OpenClaw instance (see https://docs.openclaw.ai/)

### Quick Local Setup
```bash
git clone https://github.com/Nick040791/openclaw-crm.git
cd openclaw-crm

# Option 1: Next.js dev (coming soon)
# npm install && npm run dev

# Option 2: Full self-hosted with Docker
cp .env.example .env
# Edit DB credentials, OpenClaw endpoint, etc.
docker compose up -d
```

Then explore the docs/ folder and start implementing the first module (recommended: Contacts).

## Project Structure

```
openclaw-crm/
├── README.md
├── LICENSE
├── .gitignore
├── docker-compose.yml          # Postgres + app + optional OpenClaw
├── docs/
│   ├── architecture.md
│   ├── openclaw-integration.md
│   ├── roadmap.md
│   └── modules.md
├── modules/                 # Self-contained feature modules
│   ├── contacts/
│   ├── deals/
│   ├── activities/
│   └── communications/
├── integrations/
│   └── openclaw/            # Tool definitions, bridge, manifests
├── app/                     # Next.js App Router (future)
└── ...
```

## Roadmap

See [docs/roadmap.md](./docs/roadmap.md)

**v0.1 (Current)**: Repository skeleton, architecture docs, OpenClaw integration spec, initial module patterns.
**v0.2**: Contacts + Companies module (CRUD + search), basic OpenClaw tool bridge (HTTP + example skill).
**v0.3**: Deals/Pipeline + Activities, session memory sync, web dashboard MVP.
**v1.0**: Production-ready self-host, RBAC, audit, full multi-channel orchestration, example law-firm / construction vertical configs.

## Contributing

We welcome contributions that improve modularity, OpenClaw integration quality, privacy controls, or SMB-focused features.

See [CONTRIBUTING.md](./CONTRIBUTING.md) (to be added) or open an issue/discussion.

Especially valuable:
- Real-world OpenClaw + CRM workflow feedback
- Vertical-specific modules (legal intake, construction leads, etc.)
- Performance, security, and self-hosting hardening

## License

MIT © Nicholas Beighley / KC Optimal Computing LLC
