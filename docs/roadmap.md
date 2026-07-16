# Roadmap

## Philosophy

Ship small, valuable slices that deliver immediate ROI for SMB users while building a rock-solid modular foundation. Prioritize privacy, auditability, and seamless OpenClaw agent collaboration over feature bloat.

## Version Milestones

### v0.1 — Foundation (Current)
- [x] Repository created with professional structure
- [x] Detailed architecture and OpenClaw integration specifications
- [x] Initial CI/CD bootstrap (`.github/workflows/pr-check.yml` with PR validation foundation and future-proof placeholders)
- [x] Basic Contacts schema and OpenClaw tool example (autonomous update)
- [ ] Core entity models & shared types
- [ ] Module registry pattern
- [ ] Initial docs (architecture, integration, roadmap, modules)

### v0.2 — First Usable Slice (Target: ~2-4 weeks)
- Contacts + Companies module (full CRUD, search, custom fields, relationships)
- Basic OpenClaw tool bridge (HTTP API + reference skill implementation)
- Simple audit logging
- Docker compose for easy local run (Postgres + app)
- Basic Next.js dashboard shell (list + detail views for contacts)
- Documentation: "How to connect your OpenClaw agent to the CRM"
- Expand CI/CD with real linting, type checking, and Docker validation as code lands

... (rest unchanged)