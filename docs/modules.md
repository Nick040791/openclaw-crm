# Modules

This document describes how feature modules are structured and discovered in openclaw-crm.

## Principles

- **Strict boundaries**: A module owns its schema, service, and (later) migrations and UI slice. It must not import another module's internal files.
- **Public surface only**: Cross-module needs go through the module registry, explicit public APIs, or a future event bus.
- **Privacy by default**: Minimal required fields, Zod validation at the service boundary, and agent mutations that are auditable.

## Layout

```
modules/<name>/
  schema.ts     # Zod schemas + exported types
  service.ts    # Public CRUD / domain operations (in-memory today; Drizzle later)
  # future: migrations/, ui/, tools/ (if module-local OpenClaw tools)
```

## Module Registry (`core/`)

The registry lives under `core/` so the core layer does not depend on any single module's internals beyond bootstrap.

| API | Purpose |
|-----|---------|
| `registerModule({ meta, service })` | Register a module once at bootstrap |
| `getModule(id)` | Lookup full registration |
| `listModules()` | Metadata for all modules (dashboard / health) |
| `requireModuleService(id)` | Get service or throw |

Bootstrap entry: `core/register-modules.ts` → `registerBuiltInModules()`.

Call `registerBuiltInModules()` at process start (bridge, app, tests) so discovery is consistent.

### Current built-in modules

| Id | Entities | OpenClaw tools |
|----|----------|----------------|
| `contacts` | Contact | Yes (create/get/search/update/delete/list_by_company) |
| `companies` | Company | Yes (create/get/search/update/delete) |

## Adding a module

1. Create `modules/<name>/schema.ts` and `service.ts`.
2. Register in `core/register-modules.ts` with accurate `ModuleMeta`.
3. If agent-facing, add tool definitions under `integrations/openclaw/tools/` and wire into `tools/index.ts`.
4. Document here and in the roadmap.
5. Prefer opaque string IDs and Zod at the boundary so storage (in-memory → Postgres) can change without breaking tools.

## Relationship to OpenClaw tools

Tools call **module services** only (via direct import of the service public API or, later, registry). They never reach into schema internals beyond types. The bridge dispatches by tool name; the registry is for human/UI/core discovery and future dynamic loading.

See also: [architecture.md](./architecture.md), [openclaw-integration.md](./openclaw-integration.md).
