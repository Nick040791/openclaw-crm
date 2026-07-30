/**
 * Example OpenClaw skill: openclaw-crm-bridge
 *
 * Thin client that:
 * 1. Discovers tools from GET {CRM_BRIDGE_URL}/tools
 * 2. Invokes tools via POST {CRM_BRIDGE_URL}/tools/invoke
 *
 * Designed for OpenClaw agents (or any host that loads skills).
 * No CRM business logic lives here — all validation, privacy guards,
 * and persistence stay inside the CRM modules and bridge.
 *
 * Privacy & safety:
 * - API key only from env (never hardcoded)
 * - Agent identity forwarded for audit when available
 * - Errors returned as structured objects (no stack traces to agent context)
 */

const BRIDGE_URL = (process.env.CRM_BRIDGE_URL || 'http://127.0.0.1:3100').replace(/\/$/, '');
const API_KEY = process.env.CRM_BRIDGE_API_KEY?.trim() || '';
const DEFAULT_AGENT_ID = process.env.CRM_AGENT_ID?.trim() || undefined;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface InvokeResult {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  if (DEFAULT_AGENT_ID) {
    headers['X-Agent-Id'] = DEFAULT_AGENT_ID;
  }
  return headers;
}

/**
 * Fetch the full tool catalog from the CRM bridge.
 * OpenClaw hosts can call this at skill load time to register schemas.
 */
export async function listTools(): Promise<ToolDefinition[]> {
  const res = await fetch(`${BRIDGE_URL}/tools`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CRM bridge /tools failed (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as { tools?: ToolDefinition[] };
  return data.tools ?? [];
}

/**
 * Invoke a CRM tool by name.
 * @param name Tool name (e.g. "crm.search_contacts")
 * @param args Tool arguments object
 * @param agentId Optional override for audit attribution
 */
export async function invokeTool(
  name: string,
  args: Record<string, unknown> = {},
  agentId?: string
): Promise<InvokeResult> {
  if (!name || typeof name !== 'string') {
    return { success: false, error: 'Missing or invalid tool name' };
  }

  const body: Record<string, unknown> = {
    name,
    arguments: args,
  };
  const effectiveAgent = agentId || DEFAULT_AGENT_ID;
  if (effectiveAgent) {
    body.agentId = effectiveAgent;
  }

  const res = await fetch(`${BRIDGE_URL}/tools/invoke`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  let payload: InvokeResult;
  try {
    payload = (await res.json()) as InvokeResult;
  } catch {
    return {
      success: false,
      error: `CRM bridge returned non-JSON (${res.status})`,
    };
  }

  // Bridge already returns structured success/error; surface HTTP failures clearly
  if (!res.ok && payload.success !== false) {
    return {
      success: false,
      error: payload.error || `HTTP ${res.status}`,
      ...payload,
    };
  }

  return payload;
}

/** Health check helper for skill readiness probes */
export async function health(): Promise<{
  ok: boolean;
  tools?: number;
  authRequired?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${BRIDGE_URL}/health`, { method: 'GET' });
    if (!res.ok) {
      return { ok: false, error: `Health check HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      status?: string;
      tools?: number;
      authRequired?: boolean;
    };
    return {
      ok: data.status === 'ok',
      tools: data.tools,
      authRequired: data.authRequired,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Health check failed',
    };
  }
}

/**
 * Convenience wrappers matching the current tool catalog.
 * Prefer listTools() + invokeTool() for full dynamism; these are ergonomic for demos.
 */
export const crm = {
  searchContacts: (query: string, limit = 10) =>
    invokeTool('crm.search_contacts', { query, limit }),
  getContact: (id: string) => invokeTool('crm.get_contact', { id }),
  createContact: (data: Record<string, unknown>) =>
    invokeTool('crm.create_contact', data),
  updateContact: (id: string, patch: Record<string, unknown>) =>
    invokeTool('crm.update_contact', { id, ...patch }),
  deleteContact: (id: string, confirm = false) =>
    invokeTool('crm.delete_contact', { id, confirm }),
  listContactsByCompany: (companyId: string, limit = 20) =>
    invokeTool('crm.list_contacts_by_company', { companyId, limit }),
  searchCompanies: (query: string, limit = 10) =>
    invokeTool('crm.search_companies', { query, limit }),
  getCompany: (id: string) => invokeTool('crm.get_company', { id }),
  createCompany: (data: Record<string, unknown>) =>
    invokeTool('crm.create_company', data),
  updateCompany: (id: string, patch: Record<string, unknown>) =>
    invokeTool('crm.update_company', { id, ...patch }),
  deleteCompany: (id: string, confirm = false) =>
    invokeTool('crm.delete_company', { id, confirm }),
};

export default {
  name: 'openclaw-crm-bridge',
  listTools,
  invokeTool,
  health,
  crm,
};
