/**
 * OpenClaw CRM HTTP Tool Bridge (stub)
 *
 * Minimal HTTP server that exposes the CRM tool catalog and dispatches
 * tool calls from OpenClaw agents (or any HTTP client).
 *
 * Endpoints:
 *   GET  /health          → { status: "ok", tools: N }
 *   GET  /tools           → list of tool definitions (name, description, parameters)
 *   POST /tools/invoke    → { name: string, arguments: object } → tool result
 *
 * Design notes (privacy-first + agent safety):
 * - No auth yet (dev only). Production must add API key / mTLS / scoped tokens.
 * - All mutations still go through module services (Zod validation + confirm guards).
 * - Structured JSON responses; errors never leak internal stack by default.
 * - Intended to run in the same trust boundary as the CRM or behind a reverse proxy.
 *
 * Usage (dev):
 *   pnpm bridge   # or tsx integrations/openclaw/bridge/httpServer.ts
 *   PORT=3100 pnpm bridge
 */

import http from 'node:http';
import { URL } from 'node:url';
import { allTools, toolHandlers, type ToolName } from '../tools/index.js';

const PORT = Number(process.env.BRIDGE_PORT || process.env.PORT || 3100);
const HOST = process.env.BRIDGE_HOST || '0.0.0.0';

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

async function handleInvoke(body: string) {
  let parsed: { name?: string; arguments?: Record<string, unknown> };
  try {
    parsed = JSON.parse(body || '{}');
  } catch {
    return { status: 400, body: { success: false, error: 'Invalid JSON body' } };
  }

  const name = parsed.name;
  if (!name || typeof name !== 'string') {
    return {
      status: 400,
      body: { success: false, error: 'Missing or invalid "name" (tool name)' },
    };
  }

  const handler = toolHandlers[name as ToolName];
  if (!handler) {
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
  try {
    // Log minimally for audit trail (expand later with agent identity)
    console.log(`[bridge] invoke ${name}`, JSON.stringify(args).slice(0, 200));
    const result = await handler(args);
    return { status: 200, body: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Tool execution failed';
    console.error(`[bridge] error in ${name}:`, message);
    return {
      status: 500,
      body: { success: false, error: message, tool: name },
    };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/\/$/, '') || '/';

  // CORS for local OpenClaw / browser testing (tighten in prod)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (req.method === 'GET' && path === '/health') {
      json(res, 200, {
        status: 'ok',
        service: 'openclaw-crm-bridge',
        tools: allTools.length,
        timestamp: new Date().toISOString(),
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
      const { status, body: result } = await handleInvoke(body);
      json(res, status, result);
      return;
    }

    json(res, 404, {
      success: false,
      error: 'Not found',
      endpoints: ['GET /health', 'GET /tools', 'POST /tools/invoke'],
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
});

export default server;
