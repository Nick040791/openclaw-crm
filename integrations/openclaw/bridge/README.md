# OpenClaw HTTP Tool Bridge

Lightweight HTTP server that lets OpenClaw agents (or any client) discover and invoke CRM tools.

## Quick start

```bash
# From repo root
pnpm install   # if needed
pnpm bridge    # starts on :3100 by default
```

Environment:

| Variable | Default | Purpose |
|----------|---------|---------|
| `BRIDGE_PORT` / `PORT` | `3100` | Listen port |
| `BRIDGE_HOST` | `0.0.0.0` | Bind address |
| `BRIDGE_API_KEY` | _(empty)_ | When set, requires `Authorization: Bearer <key>` or `X-API-Key` on `/tools` and `/tools/invoke` |
| `BRIDGE_RATE_LIMIT_RPM` | `60` | Max requests per client IP per rolling 60s window |

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness + tool count + auth/rate-limit flags |
| GET | `/tools` | Yes* | Full tool catalog (name, description, JSON Schema parameters) |
| POST | `/tools/invoke` | Yes* | Execute a tool |
| GET | `/audit?limit=20` | Yes* | Recent structured audit entries (in-memory ring buffer) |

\* Auth required only when `BRIDGE_API_KEY` is configured.

### Invoke body

```json
{
  "name": "crm.create_contact",
  "arguments": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "tags": ["vip"]
  },
  "agentId": "optional-openclaw-agent-id"
}
```

You may also pass agent identity via header `X-Agent-Id`.

Response is the structured result from the tool handler (success flag, entity, message, or error).

## Security (current status)

- **Optional API key**: set `BRIDGE_API_KEY` in production. Prefer reverse-proxy or mTLS in high-trust environments.
- **Rate limiting**: per-client sliding window (in-memory; not shared across processes).
- **Audit**: every invoke is logged with timestamp, tool name, outcome, duration, client, optional agentId, and a short hash of parameters (raw args are not stored in the audit ring to reduce PII exposure).
- Business validation (Zod schemas, delete `confirm: true` guards) remains inside module services and tool handlers.

## Integration with OpenClaw

Point an OpenClaw skill / tool definition at this bridge:

1. Fetch `GET /tools` (with auth header if configured) to register schemas, or hard-code the known tools.
2. On agent tool call, `POST /tools/invoke` with the tool name and arguments.
3. Return the JSON result to the agent context.
4. Prefer sending a stable `agentId` (body or `X-Agent-Id`) so audit trails attribute actions correctly.

See `docs/openclaw-integration.md` for broader patterns (session memory, webhooks).

## Next improvements

- Example OpenClaw skill package that wraps `/tools/invoke`
- Persistent audit sink (Postgres / file) with retention policy
- OpenAPI / JSON Schema export for the whole surface
- Stdio / MCP-compatible transport
- Shared rate-limit store (Redis) for multi-instance deployments
