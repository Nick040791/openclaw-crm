/**
 * Bootstrap: register all built-in modules with the core registry.
 *
 * Import this once at process start (bridge, future app entry, tests).
 * Keeps module discovery in one place without circular imports between
 * modules themselves.
 */

import { registerModule } from './module-registry.js';
import contactsService from '../modules/contacts/service.js';
import companiesService from '../modules/companies/service.js';

let bootstrapped = false;

export function registerBuiltInModules(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  registerModule({
    meta: {
      id: 'contacts',
      name: 'Contacts',
      description:
        'People records with optional company link, tags, and custom fields. Privacy-first minimal required fields.',
      version: '0.2.0',
      entities: ['Contact'],
      openClawTools: true,
    },
    service: contactsService as import('./module-registry.js').ModulePublicService,
  });

  registerModule({
    meta: {
      id: 'companies',
      name: 'Companies',
      description:
        'Organization records with domain, industry, size band, and custom fields.',
      version: '0.2.0',
      entities: ['Company'],
      openClawTools: true,
    },
    service: companiesService as import('./module-registry.js').ModulePublicService,
  });
}

export default registerBuiltInModules;
