# OpenClaw Integration Guide

This document describes how openclaw-crm exposes its capabilities to OpenClaw agents and how the two systems stay in sync.

## Goals of Integration

1. Let OpenClaw agents **act** on CRM data using natural language in any connected chat app.
2. Keep **context** rich: agents know recent deals, open tasks, communication history without manual copy-paste.
3. Enable **proactive** workflows (agent suggests follow-ups, flags stalled deals, routes inbound leads).
4. Maintain full **auditability** and human oversight.

## Current OpenClaw Capabilities (as of mid-2026)

From public documentation:
- Gateway process bridges 10+ chat channels to AI agents.
- Agents support **tool use**, **skills**, **sessions** (isolated), **memory**, multi-agent routing, cron, webhooks, automation.
- CLI (`openclaw`) and Web Control UI for management.
- Extensible via channel plugins and ClawHub.

**Tool calling** is the primary integration point. Agents can be given skills/tools that invoke external services.

## Recommended Integration Patterns

### 1. Tool / Skill Exposure (Primary)

Provide a catalog of typed, safe tools that an OpenClaw agent can call.

Example tools (high priority for v0.2):
- `crm.search_contacts(query, limit?)` 
- `crm.get_contact(id)`
- `crm.create_contact(data)`
- `crm.update_deal(id, patch)`
- `crm.search_deals(filters)`
- `crm.log_activity(contact_id, type, notes, channel?)`
- `crm.summarize_deal(id)` or `crm.get_pipeline_health()`
- `crm.list_open_tasks(owner?)`

**Implementation options**:
- HTTP REST API (OpenAPI spec) + OpenClaw skill that calls it (recommended starting point)
- Stdio / MCP-style tool server (if OpenClaw supports direct process tools)
- Dedicated bridge process (Node script) registered as a skill

Provide **JSON Schema** for every tool (parameters + return type) so agents get reliable structured output.

### 2. Session & Memory Bridging

When an agent starts or resumes a session related to a contact/deal:
- Inject relevant CRM context into the OpenClaw session memory (recent activities, open deals, notes).
- On agent action that changes CRM state, update the corresponding OpenClaw memory entry.

This makes conversations stateful and dramatically reduces hallucinations about customer status.

### 3. Event / Webhook Sync

- CRM emits events on create/update (deal moved, new note, task completed)
- OpenClaw can subscribe via webhooks or poll, then trigger agent workflows or notifications in the right channel.
- Example: "New lead from website form" → create Contact + Deal → notify owner in Slack via OpenClaw + suggest first outreach message.

### 4. Channel-Aware Communications

Since OpenClaw already handles the channel abstraction, the CRM should:
- Store `channel` and `external_message_id` on Activity records
- Allow agents to initiate messages in the customer's preferred channel ("Send proposal to client via WhatsApp")
- Thread conversations across channels where possible (link WhatsApp thread to email thread via contact).

## HTTP Tool Bridge (v0.2)

A Node HTTP server lives at `integrations/openclaw/bridge/httpServer.ts`.

```bash
pnpm bridge          # default :3100
BRIDGE_PORT=3200 BRIDGE_API_KEY=dev-secret pnpm bridge
```

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | No | Liveness + tool count + flags |
| GET | `/tools` | Optional* | Full catalog (name, description, parameters) |
| POST | `/tools/invoke` | Optional* | `{ "name": "crm.search_contacts", "arguments": { ... }, "agentId"?: "..." }` |
| GET | `/audit?limit=20` | Optional* | Recent structured audit entries |

\* When `BRIDGE_API_KEY` is set, send `Authorization: Bearer <key>` or `X-API-Key: <key>`. Rate limit defaults to 60 req/min per client IP (`BRIDGE_RATE_LIMIT_RPM`).

All tools currently registered in `integrations/openclaw/tools/index.ts` are available:

- Contacts: create, get, search, update, delete (delete requires `confirm: true`)
- Companies: create, get, search, update, delete (delete requires `confirm: true`)
- Relationship: `crm.list_contacts_by_company`

**Audit**: every invoke records timestamp, tool, outcome, duration, client, optional agentId, and a short hash of parameters (raw argument values are not retained in the audit ring).

See `integrations/openclaw/bridge/README.md` for details.

## Example OpenClaw Skill (v0.2)

A ready-to-adapt client skill lives at `integrations/openclaw/skills/crm-bridge/`.

| Export | Role |
|--------|------|
| `listTools()` | Discovers schemas from `GET /tools` |
| `invokeTool(name, args, agentId?)` | Calls `POST /tools/invoke` |
| `health()` | Bridge readiness |
| `crm.*` | Convenience wrappers (search/create/update/delete contacts & companies) |

**Configure via env** (never hardcode secrets):

- `CRM_BRIDGE_URL` (default `http://127.0.0.1:3100`)
- `CRM_BRIDGE_API_KEY` (must match bridge `BRIDGE_API_KEY` when set)
- `CRM_AGENT_ID` (optional default for audit attribution)

Minimal agent-host pattern:

```ts
import skill from './integrations/openclaw/skills/crm-bridge';

const tools = await skill.listTools();
// register tools with OpenClaw agent tool registry

const result = await skill.invokeTool('crm.search_contacts', {
  query: 'Acme',
  limit: 5,
});
```

Full details and a manual test snippet: `integrations/openclaw/skills/crm-bridge/README.md`.

## Reference: Tool Schema Example (TypeScript / JSON Schema)

```ts
// integrations/openclaw/tools/searchContacts.ts
export const searchContactsTool = {
  name: "crm.search_contacts",
  description: "Search contacts by name, email, company, or tags. Returns up to limit results.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search string" },
      limit: { type: "number", default: 10, minimum: 1, maximum: 50 },
      tags: { type: "array", items: { type: "string" } }
    },
    required: ["query"]
  }
}
```

Agents receive structured results and can chain calls.

## Running Alongside OpenClaw

Recommended local dev setup:

```yaml
# docker-compose.yml excerpt
services:
  postgres:
    ...
  crm:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENCLAW_GATEWAY_URL=http://openclaw:18789
      - ...
  # Optional: run OpenClaw gateway in same compose for testing
  openclaw:
    image: ... # or local build
    ...
```

Configure your OpenClaw `~/.openclaw/openclaw.json` or agent config to include the CRM tools/skills pointing at the bridge (`http://host:3100`), including the API key header when configured.

## Security Notes for Agent Access

- Tools should require scoped API keys or mTLS when called from OpenClaw
- All agent-initiated mutations must be logged with agent identity + human review flag where appropriate
- Rate limiting and validation on every tool
- Prefer read-heavy tools initially; mutations behind confirmation flows in early versions

## Next Steps for Integration

1. ~~Publish an example OpenClaw skill that wraps `/tools/invoke` (with auth header support)~~ — done: `integrations/openclaw/skills/crm-bridge/`
2. Persist audit log beyond the in-memory ring buffer
3. Add memory injection helper
4. Test end-to-end with a real OpenClaw channel (e.g. local Slack or Discord test workspace)
5. Document exact configuration steps for end users

See also the main README and architecture docs. Feedback on real OpenClaw usage patterns is highly valuable.
