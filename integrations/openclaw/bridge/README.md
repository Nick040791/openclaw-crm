# OpenClaw HTTP Tool Bridge

Lightweight HTTP server that lets OpenClaw agents (or any client) discover and invoke CRM tools.

## Quick start

```bash
# From repo root
pnpm install   # if needed
pnpm bridge    # starts on :3100 by default
```

Environment:
- `BRIDGE_PORT` / `PORT` (default 3100)
- `BRIDGE_HOST` (default 0.0.0.0)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness + tool count |
| GET | `/tools` | Full tool catalog (name, description, JSON Schema parameters) |
| POST | `/tools/invoke` | Execute a tool |

### Invoke body

```json
{
  "name": "crm.create_contact",
  "arguments": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "tags": ["vip"]
  }
}
```

Response is the structured result from the tool handler (success flag, entity, message, or error).

## Security (current status)

- **Dev only**: no authentication.
- Production must add:
  - API key or JWT in `Authorization` header
  - Optional mTLS
  - Rate limiting
  - Agent identity logging for audit

All business validation (Zod schemas, delete confirm guards) remains inside the module services and tool handlers.

## Integration with OpenClaw

Point an OpenClaw skill / tool definition at this bridge:

1. Fetch `GET /tools` to register schemas, or hard-code the known tools.
2. On agent tool call, `POST /tools/invoke` with the tool name and arguments.
3. Return the JSON result to the agent context.

See `docs/openclaw-integration.md` for broader patterns (session memory, webhooks).

## Next improvements

- Auth middleware
- OpenAPI / JSON Schema export for the whole surface
- Stdio / MCP-compatible transport
- Structured audit log of every invocation (agent id, tool, params hash, outcome)
