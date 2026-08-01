/**
 * Module Registry — core pattern for strict modularity.
 *
 * Modules register themselves with metadata and a public service surface.
 * Consumers (bridge, future dashboard, event bus) look up modules by id
 * without importing module internals. Cross-module communication must go
 * through registered public APIs or future events — never direct imports
 * of another module's implementation files.
 *
 * Privacy note: registry itself holds no PII; services enforce validation
 * and audit at the call site.
 */

export type ModuleId = 'contacts' | 'companies' | string;

export interface ModuleMeta {
  /** Stable machine id (matches folder name under modules/) */
  id: ModuleId;
  /** Human-readable name */
  name: string;
  /** Short description for docs / dashboard */
  description: string;
  /** Semver of this module's public surface */
  version: string;
  /** Entity names this module owns */
  entities: string[];
  /** Whether the module exposes OpenClaw tools (informational) */
  openClawTools?: boolean;
}

/**
 * Minimal public service contract. Concrete modules may expose more methods;
 * registry only guarantees these for discovery. Callers should use typed
 * imports of the module service when they need full API surface.
 */
export interface ModulePublicService {
  list?(limit?: number): Promise<unknown[]>;
  get?(id: string): Promise<unknown | null>;
  search?(query?: string, limit?: number): Promise<unknown[]>;
  create?(data: unknown): Promise<unknown>;
  update?(id: string, data: unknown): Promise<unknown | null>;
  delete?(id: string): Promise<boolean>;
  [key: string]: unknown;
}

export interface RegisteredModule {
  meta: ModuleMeta;
  service: ModulePublicService;
}

const registry = new Map<ModuleId, RegisteredModule>();

/**
 * Register a module. Idempotent by id (last write wins; prefer single
 * registration at bootstrap).
 */
export function registerModule(mod: RegisteredModule): void {
  if (!mod?.meta?.id) {
    throw new Error('Module registration requires meta.id');
  }
  if (!mod.service) {
    throw new Error(`Module "${mod.meta.id}" requires a public service object`);
  }
  registry.set(mod.meta.id, mod);
}

/** Get a registered module by id, or undefined. */
export function getModule(id: ModuleId): RegisteredModule | undefined {
  return registry.get(id);
}

/** List all registered modules (metadata only by default). */
export function listModules(): ModuleMeta[] {
  return Array.from(registry.values()).map((m) => m.meta);
}

/** Get service for a module or throw if missing. */
export function requireModuleService(id: ModuleId): ModulePublicService {
  const mod = registry.get(id);
  if (!mod) {
    throw new Error(`Module not registered: ${id}`);
  }
  return mod.service;
}

/** Clear registry (for tests only). */
export function _clearRegistryForTests(): void {
  registry.clear();
}

export default {
  registerModule,
  getModule,
  listModules,
  requireModuleService,
};
