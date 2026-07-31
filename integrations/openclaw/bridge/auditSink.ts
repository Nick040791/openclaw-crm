/**
 * Persistent audit sink for the OpenClaw CRM HTTP bridge.
 *
 * Append-only JSON Lines (JSONL) writer. Designed for privacy-first operation:
 * - Stores only structured metadata already present on AuditEntry
 * - Never writes raw tool arguments (callers pass paramsHash only)
 * - Failures are logged to console but do not break tool invocation
 *
 * Enable via BRIDGE_AUDIT_PATH (directory or full .jsonl file path).
 * When unset, the sink is a no-op and only the in-memory ring is used.
 */

import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface AuditEntry {
  ts: string;
  tool: string;
  outcome: 'success' | 'error' | 'rejected';
  durationMs: number;
  client: string;
  agentId?: string;
  paramsHash?: string;
  error?: string;
}

const AUDIT_PATH_ENV = process.env.BRIDGE_AUDIT_PATH?.trim() || '';

/** Resolved path to the JSONL file, or null when persistence is disabled. */
function resolveAuditFilePath(): string | null {
  if (!AUDIT_PATH_ENV) return null;
  // If the path ends with .jsonl / .log / .txt treat as file; otherwise as directory.
  if (/\.(jsonl|log|txt)$/i.test(AUDIT_PATH_ENV)) {
    return AUDIT_PATH_ENV;
  }
  return join(AUDIT_PATH_ENV, 'bridge-audit.jsonl');
}

let ensuredDir: string | null = null;

async function ensureParentDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  if (ensuredDir === dir) return;
  await mkdir(dir, { recursive: true });
  ensuredDir = dir;
}

/**
 * Append one audit entry as a single JSON line.
 * Safe to call on every invoke; never throws to the caller.
 */
export async function persistAuditEntry(entry: AuditEntry): Promise<void> {
  const filePath = resolveAuditFilePath();
  if (!filePath) return;

  try {
    await ensureParentDir(filePath);
    const line = JSON.stringify(entry) + '\n';
    await appendFile(filePath, line, { encoding: 'utf8' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[audit-sink] failed to write ${filePath}: ${message}`);
  }
}

/** Whether a persistent path is configured (for /health and docs). */
export function isPersistentAuditEnabled(): boolean {
  return Boolean(resolveAuditFilePath());
}

/** Effective file path for operators (null when disabled). */
export function getAuditFilePath(): string | null {
  return resolveAuditFilePath();
}
