/**
 * Core package surface — module registry and bootstrap.
 * Future: event bus, shared types, auth helpers.
 */

export {
  registerModule,
  getModule,
  listModules,
  requireModuleService,
  type ModuleId,
  type ModuleMeta,
  type ModulePublicService,
  type RegisteredModule,
} from './module-registry.js';

export { registerBuiltInModules } from './register-modules.js';
