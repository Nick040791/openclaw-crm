# Roadmap

## Philosophy

Ship small, valuable slices that deliver immediate ROI for SMB users while building a rock-solid modular foundation. Prioritize privacy, auditability, and seamless OpenClaw agent collaboration over feature bloat.

## Version Milestones

### v0.1 — Foundation (Current)
- [x] Repository created with professional structure
- [x] Detailed architecture and OpenClaw integration specifications
- [x] Initial CI/CD bootstrap (`.github/workflows/pr-check.yml` with PR validation foundation and future-proof placeholders)
- [x] Basic Contacts schema and OpenClaw tool example (autonomous update)
- [x] Company schema + additional core tool (crm.get_contact) - autonomous run
- [x] Enhanced CI/CD with Node.js/pnpm/TypeScript/linting support
- [x] Basic Contacts service layer (in-memory CRUD)
- [x] Basic Companies service layer (in-memory CRUD)
- [ ] Core entity models & shared types (expand as needed)
- [ ] Module registry pattern

### v0.2 — First Usable Slice (Target: ~2-4 weeks)
- [x] Docker compose for easy local run (Postgres + app) + CI validation
- [x] Contacts + Companies module foundations (schemas + services)
- [ ] Contacts + Companies module (full CRUD, search, custom fields, relationships)
- [ ] Basic OpenClaw tool bridge (HTTP API + reference skill implementation)
- [ ] Simple audit logging
- [ ] Basic Next.js dashboard shell (list + detail views for contacts)
- [ ] Documentation: "How to connect your OpenClaw agent to the CRM"
- [x] Expand CI/CD with real linting, type checking, and Docker validation as code lands

### v0.3 — Pipeline & Activity Core
- Deals / Pipeline module (stages, value tracking, kanban views)
- Activities & Tasks (timeline, reminders, AI-suggested follow-ups)
- Session memory bridging (inject CRM context into OpenClaw sessions)
- Event emission + basic webhook support
- Role-based access (owner, team member, viewer)
- Improved error handling and structured logging

### v1.0 — Production-Ready for Pilot Customers
- Full RBAC + organization support
- Reporting & AI insight module (pipeline health, stalled deals, suggested actions)
- Communications history synced from OpenClaw channels
- Data export (complete JSON bundle + attachments) + secure deletion
- Vertical starter templates (e.g. Law Firm Intake, Construction Lead Mgmt)
- Performance testing, security audit basics
- Public demo video / storybook of agent + human workflows
- Optional cloud hosting option (multi-tenant on Azure, leveraging existing credits)

### Future (Post v1.0)
- Advanced agent orchestration (multi-agent handoff between research, drafting, and CRM update agents)
- Low-code / visual module builder or custom field UI
- Integration with other KC Optimal tools (Neuron skills, Kanga workflows, n8n automations)
- Marketplace for community modules
- Mobile-responsive PWA or companion mobile node (inspired by OpenClaw mobile)
- Confidential computing / TEE deployment options for sensitive verticals

## Success Metrics (to track from day one)

- Time from lead capture to first meaningful agent-assisted follow-up
- % of routine updates performed by agents vs humans
- User-reported time saved per week (survey + objective logs)
- Accuracy of agent tool calls (human review rate)
- Self-host adoption vs cloud
- Module reuse / extensibility (how easy it is for contributors to add vertical logic)

These metrics directly support KC Optimal Computing's mission of practical, measurable AI for local SMBs.

## How to Influence the Roadmap

Open issues with use-case descriptions, vertical requirements (law, construction, accounting), or OpenClaw workflow ideas. PRs that implement clean modules or improve integration quality are especially welcome.

---
**Latest autonomous update (2026-07-24 CDT)**: Added Companies service layer and createCompany tool. No open PRs. Progress on v0.2 Contacts+Companies foundations. Next: full CRUD relations, tool handlers, or dashboard shell.