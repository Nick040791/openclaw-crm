# Architecture

## Principles

1. **Strict Modularity**: Every major capability lives in its own module. Modules do not directly import each other's internal implementation. They communicate via the Core service layer, events, or well-defined public APIs.
2. **Privacy by Default**: Data minimization, explicit consent/audit for cross-module or external sharing, easy export + cryptographic deletion. Self-host friendly (no external calls unless explicitly configured).
3. **Agent-First but Human-in-Loop**: OpenClaw agents are powerful co-pilots. Every automated action should be auditable and reversible where possible. UI always shows provenance ("Suggested by Agent X").
4. **Extensibility over Monolith**: New verticals or features should be addable as modules without core changes.
5. **Observable & Measurable**: Built-in metrics for time-saved, automation rate, response latency. Aligns with KC Optimal's focus on tangible ROI for SMBs.

## High-Level Components

- **Core Layer** (`core/` or shared lib)
  - Entity registry & base models (Contact, Deal, Activity, etc. with soft deletes, versioning)
  - Authentication & Authorization (RBAC, organization units/teams, API keys for agents)
  - Audit logging & data lineage
  - Event bus (lightweight, e.g. in-memory + Redis or Postgres LISTEN/NOTIFY for prod)
  - Configuration & feature flags per module

- **Module Layer** (`modules/<name>/`)
  - Own database schema / migrations (Drizzle)
  - Repository / service layer
  - Public API surface (REST + tRPC or typed functions)
  - UI components / pages slice (when frontend ready)
  - Tests, seeds, and documentation
  - Optional: module-specific OpenClaw tools

- **Integration Layer** (`integrations/openclaw/`)
  - Tool catalog & JSON Schema definitions
  - Bridge service (HTTP server or stdio that OpenClaw agents can invoke)
  - Session context provider (pulls CRM state into OpenClaw memory)
  - Webhook receiver (OpenClaw → CRM events)
  - Manifest / configuration examples

- **Presentation Layer**
  - Next.js App Router (server components + streaming where useful)
  - Role-aware dashboards and command surfaces
  - Embeddable widgets for future OpenClaw Control UI or custom frontends

## Data Model (Initial)

Core entities (shared across modules):
- Contact (id, name, emails, phones, company_id, tags, custom_fields jsonb, created_at, ...)
- Company (id, name, domain, industry, size, custom_fields, ...)
- Deal (id, title, contact_id/company_id, pipeline_id, stage, value, expected_close, owner_id, ...)
- Activity (id, type, contact_id/deal_id, channel (openclaw|email|call|meeting), content, timestamp, agent_id?)
- Note, Task, Attachment, etc.

Relationships are explicit. Custom fields use jsonb + schema validation per module.

## Technology Choices (Recommended for v1)

- **Language/Runtime**: TypeScript + Node.js (Next.js full-stack for speed; C#/.NET option for high-concurrency enterprise later)
- **Web Framework**: Next.js 15 (App Router, Server Actions, React Server Components)
- **Styling**: Tailwind CSS + shadcn/ui + Radix
- **ORM / DB**: Drizzle ORM (Postgres primary, SQLite for local/dev). Postgres for jsonb, full-text, audit.
- **Auth**: Auth.js (self-hostable) or lightweight JWT + RBAC service. Future: integrate with your existing identity providers.
- **Observability**: OpenTelemetry or simple structured logging + Prometheus scrape endpoint
- **Deployment**: Docker multi-stage, docker-compose (Postgres + Redis optional + app). Kubernetes manifests later.

## Module Addition Pattern

To add a new module (example: `marketing` or `legal-matters`):
1. Create `modules/marketing/`
2. Define schema in `modules/marketing/schema.ts`
3. Implement service + public API
4. Register in core module registry
5. Add OpenClaw tool definitions if agent-relevant
6. Document in docs/modules.md
7. Add UI slice under app/(dashboard)/marketing/

This keeps the system maintainable as it grows.

## Security & Privacy Considerations

- All PII encrypted at rest option (field-level or whole DB with client keys)
- Agent actions require explicit scopes + audit
- Data export (full JSON + attachments) and cryptographic wipe endpoints
- No telemetry to external parties by default
- OpenClaw bridge runs in same trust boundary or via mTLS

See also the privacy section in the main README and KC Optimal Computing principles.