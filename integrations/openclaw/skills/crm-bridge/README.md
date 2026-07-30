# Example OpenClaw Skill: CRM Bridge Client

Thin skill that lets an OpenClaw agent use openclaw-crm tools over the HTTP bridge.

## What it does

| Function | Purpose |
|----------|---------|
| `listTools()` | `GET /tools` — discover current tool schemas |
| `invokeTool(name, args, agentId?)` | `POST /tools/invoke` — execute any registered tool |
| `health()` | `GET /health` — readiness probe |
| `crm.*` | Typed convenience wrappers for Contacts & Companies |

All business rules (Zod validation, delete confirmation, rate limits, audit) stay on the CRM bridge / modules. This skill is only a client.

## Prerequisites

1. CRM bridge running (`pnpm bridge` from repo root, default `http://127.0.0.1:3100`).
2. Optional: set `BRIDGE_API_KEY` on the bridge and the matching key here.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `CRM_BRIDGE_URL` | No (default `http://127.0.0.1:3100`) | Bridge base URL |
| `CRM_BRIDGE_API_KEY` | No | Bearer / X-API-Key value |
| `CRM_AGENT_ID` | No | Default agent identity for audit |

## Usage from an OpenClaw agent host

```ts
import skill from './integrations/openclaw/skills/crm-bridge';

// At skill load / agent boot
const tools = await skill.listTools();
// Register `tools` with the agent's tool registry (host-specific)

// On agent tool call
const result = await skill.invokeTool('crm.search_contacts', {
  query: 'Ada',
  limit: 5,
});

// Or use convenience helpers
const created = await skill.crm.createContact({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  tags: ['historical'],
});
```

## Manual test (Node)

```bash
# Terminal 1
pnpm bridge

# Terminal 2
CRM_BRIDGE_URL=http://127.0.0.1:3100 npx tsx -e "
  import s from './integrations/openclaw/skills/crm-bridge/index.ts';
  const h = await s.health();
  console.log('health', h);
  const tools = await s.listTools();
  console.log('tools', tools.map(t => t.name));
  const r = await s.crm.createContact({ name: 'Test Contact' });
  console.log('create', r);
"
```

## Security notes

- Never commit real API keys. Use env or OpenClaw secret stores.
- Prefer network isolation (same Docker network / localhost) over public exposure of the bridge.
- Delete tools require `confirm: true` — the skill does not bypass that guard.
- Forward a stable `agentId` so CRM audit logs attribute actions correctly.

## Next steps

- Package as a ClawHub / OpenClaw skill distribution when the host format is finalized.
- Add session-memory injection helpers (pull contact context into agent memory).
- Wire into docker-compose as an optional sidecar demo.

See also: `docs/openclaw-integration.md`, `integrations/openclaw/bridge/README.md`.
