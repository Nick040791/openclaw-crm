/**
 * OpenClaw CRM HTTP Tool Bridge
 *
 * Minimal HTTP server that exposes the CRM tool catalog and dispatches
 * tool calls from OpenClaw agents (or any HTTP client).
 *
 * Endpoints:
 *   GET  /health          → { status: "ok", tools: N }  (always public)
 *   GET  /tools           → list of tool definitions
 *   POST /tools/invoke    → { name: string, arguments: object } → tool result
 *
 * Security (v0.2 hardening):
 * - Optional API key via BRIDGE_API_KEY (Authorization: Bearer <key> or X-API-Key)
 * - In-memory sliding-window rate limit per client IP (BRIDGE_RATE_LIMIT_RPM)
 * - Structured audit log for every invoke (no full PII in logs by default)
 *
 * Design notes (privacy-first + agent safety):
 * - All mutations still go through module services (Zod validation + confirm guards).
 * - Structured JSON responses; errors never leak internal stack by default.
 * - Intended to run in the same trust boundary as the CRM or behind a reverse proxy.
 *
 * Usage (dev):
 *   pnpm bridge   # or tsx integrations/openclaw/bridge/httpServer.ts
 *   BRIDGE_PORT=3100 BRIDGE_API_KEY=dev-secret pnpm bridge
 */

import http from 'node:http';
import { URL } from 'node:url';
import { createHash } from 'node:crypto';
import { allTools, toolHandlers, type ToolName } from '../tools/index.js';

const PORT = Number(process.env.BRIDGE_PORT || process.env.PORT || 3100);
const HOST = process.env.BRIDGE_HOST || '0.0.0.0';
const API_KEY = process.env.BRIDGE_API_KEY?.trim() || '';
const RATE_LIMIT_RPM = Math.max(
  1,
  Number(process.env.BRIDGE_RATE_LIMIT_RPM || 60)
);

// --- Simple in-memory rate limiter (per client key, sliding 60s window) ---
const rateBuckets = new Map<string, number[]>();

function clientKey(req: http.IncomingMessage): string {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length > 0) {
    return xf.split(',')[0]!.trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  let timestamps = rateBuckets.get(key) || [];
  timestamps = timestamps.filter((t) => now - t < windowMs);
  if (timestamps.length >= RATE_LIMIT_RPM) {
    rateBuckets.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return false;
}

// --- Auth helper ---
function extractApiKey(req: http.IncomingMessage): string | null {
  const auth = req.headers.authorization;
  if (auth && typeof auth === 'string') {
    const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
    if (m) return m[1]!.trim();
  }
  const xKey = req.headers['x-api-key'];
  if (typeof xKey === 'string' && xKey.trim()) return xKey.trim();
  return null;
}

function requireAuth(req: http.IncomingMessage): boolean {
  if (!API_KEY) return true; // auth disabled when no key configured (dev default)
  const provided = extractApiKey(req);
  return provided === API_KEY;
}

// --- Lightweight audit log (structured, PII-minimized) ---
interface AuditEntry {
  ts: string;
  tool: string;
  outcome: 'success' | 'error' | 'rejected';
  durationMs: number;
  client: string;
  agentId?: string;
  paramsHash?: string;
  error?: string;
}

const auditLog: AuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 500;

function hashParams(args: Record<string, unknown>): string {
  try {
    const json = JSON.stringify(args);
    return createHash('sha256').update(json).digest('hex').slice(0, 16);
  } catch {
    return 'unhashable';
  }
}

function recordAudit(entry: AuditEntry) {
  auditLog.push(entry);
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog.splice(0, auditLog.length - MAX_AUDIT_ENTRIES);
  }
  // Console line for operators / log shippers
  console.log(
    `[audit] ${entry.ts} tool=${entry.tool} outcome=${entry.outcome} ms=${entry.durationMs} client=${entry.client}` +
      (entry.agentId ? ` agent=${entry.agentId}` : '') +
      (entry.error ? ` err=${entry.error}` : '')
  );
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleInvoke(
  body: string,
  client: string,
  agentId?: string
): Promise<{ status: number; body: unknown }> {
  const started = Date.now();
  let parsed: {
    name?: string;
    arguments?: Record<string, unknown>;
    agentId?: string;
  };
  try {
    parsed = JSON.parse(body || '{}');
  } catch {
    recordAudit({
      ts: new Date().toISOString(),
      tool: '(invalid)',
      outcome: 'rejected',
      durationMs: Date.now() - started,
      client,
      agentId,
      error: 'Invalid JSON body',
    });
    return { status: 400, body: { success: false, error: 'Invalid JSON body' } };
  }

  const name = parsed.name;
  const effectiveAgentId =
    (typeof parsed.agentId === 'string' && parsed.agentId) || agentId;

  if (!name || typeof name !== 'string') {
    recordAudit({
      ts: new Date().toISOString(),
      tool: '(missing)',
      outcome: 'rejected',
      durationMs: Date.now() - started,
      client,
      agentId: effectiveAgentId,
      error: 'Missing or invalid "name"',
    });
    return {
      status: 400,
      body: { success: false, error: 'Missing or invalid "name" (tool name)' },
    };
  }

  const handler = toolHandlers[name as ToolName];
  if (!handler) {
    recordAudit({
      ts: new Date().toISOString(),
      tool: name,
      outcome: 'rejected',
      durationMs: Date.now() - started,
      client,
      agentId: effectiveAgentId,
      error: `Unknown tool: ${name}`,
    });
    return {
      status: 404,
      body: {
        success: false,
        error: `Unknown tool: ${name}`,
        available: Object.keys(toolHandlers),
      },
    };
  }

  const args = parsed.arguments ?? {};
  const paramsHash = hashParams(args);

  try {
    const result = await handler(args);
    recordAudit({
      ts: new Date().toISOString(),
      tool: name,
      outcome: 'success',
      durationMs: Date.now() - started,
      client,
      agentId: effectiveAgentId,
      paramsHash,
    });
    return { status: 200, body: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Tool execution failed';
    recordAudit({
      ts: new Date().toISOString(),
      tool: name,
      outcome: 'error',
      durationMs: Date.now() - started,
      client,
      agentId: effectiveAgentId,
      paramsHash,
      error: message,
    });
    return {
      status: 500,
      body: { success: false, error: message, tool: name },
    };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const client = clientKey(req);

  // CORS for local OpenClaw / browser testing (tighten in prod)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-API-Key, X-Agent-Id'
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // Rate limit all non-health endpoints
    if (path !== '/health' && isRateLimited(client)) {
      json(res, 429, {
        success: false,
        error: 'Rate limit exceeded',
        limitRpm: RATE_LIMIT_RPM,
      });
      return;
    }

    if (req.method === 'GET' && path === '/health') {
      json(res, 200, {
        status: 'ok',
        service: 'openclaw-crm-bridge',
        tools: allTools.length,
        authRequired: Boolean(API_KEY),
        rateLimitRpm: RATE_LIMIT_RPM,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Auth gate for tools endpoints when BRIDGE_API_KEY is set
    if ((path === '/tools' || path === '/tools/invoke') && !requireAuth(req)) {
      json(res, 401, {
        success: false,
        error: 'Unauthorized — provide Authorization: Bearer <key> or X-API-Key',
      });
      return;
    }

    if (req.method === 'GET' && path === '/tools') {
      json(res, 200, {
        tools: allTools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      });
      return;
    }

    if (req.method === 'POST' && path === '/tools/invoke') {
      const body = await readBody(req);
      const agentHeader = req.headers['x-agent-id'];
      const agentId =
        typeof agentHeader === 'string' ? agentHeader.trim() : undefined;
      const { status, body: result } = await handleInvoke(body, client, agentId);
      json(res, status, result);
      return;
    }

    // Optional: recent audit tail for operators (auth-protected when key set)
    if (req.method === 'GET' && path === '/audit') {
      if (!requireAuth(req)) {
        json(res, 401, { success: false, error: 'Unauthorized' });
        return;
      }
      const limit = Math.min(
        100,
        Math.max(1, Number(url.searchParams.get('limit') || 20))
      );
      json(res, 200, {
        entries: auditLog.slice(-limit).reverse(),
        totalRetained: auditLog.length,
      });
      return;
    }

    json(res, 404, {
      success: false,
      error: 'Not found',
      endpoints: [
        'GET /health',
        'GET /tools',
        'POST /tools/invoke',
        'GET /audit?limit=20',
      ],
    });
  } catch (err) {
    console.error('[bridge] unhandled', err);
    json(res, 500, { success: false, error: 'Internal server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[openclaw-crm bridge] listening on http://${HOST}:${PORT}`);
  console.log(`  GET  /health`);
  console.log(`  GET  /tools`);
  console.log(`  POST /tools/invoke  { "name": "crm.search_contacts", "arguments": { "query": "..." } }`);
  console.log(`  GET  /audit?limit=20`);
  if (API_KEY) {
    console.log(`  Auth: ENABLED (BRIDGE_API_KEY set)`);
  } else {
    console.log(`  Auth: DISABLED (set BRIDGE_API_KEY for production)`);
  }
  console.log(`  Rate limit: ${RATE_LIMIT_RPM} req/min per client`);
});

export default server;
