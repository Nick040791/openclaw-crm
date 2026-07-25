/**
 * OpenClaw CRM Tool Catalog
 *
 * Central export of all agent-facing tools and their handlers.
 * The future HTTP/stdio bridge will register these definitions
 * and dispatch calls to the corresponding handle* functions.
 *
 * Design principles:
 * - Strict modularity: tools only call module public services
 * - Privacy-first: delete requires explicit confirm; minimal required fields
 * - Agent safety: clear descriptions, bounded limits, structured success/error responses
 * - Audit-ready: every mutation should eventually be logged with agent identity
 */

export { createContactTool, handleCreateContact } from './createContact';
export type { CreateContactParams } from './createContact';

export { getContactTool, handleGetContact } from './getContact';
export type { GetContactParams } from './getContact';

export { searchContactsTool, handleSearchContacts } from './searchContacts';
export type { SearchContactsParams } from './searchContacts';

export { updateContactTool, handleUpdateContact } from './updateContact';
export type { UpdateContactParams } from './updateContact';

export { deleteContactTool, handleDeleteContact } from './deleteContact';
export type { DeleteContactParams } from './deleteContact';

export { createCompanyTool, handleCreateCompany } from './createCompany';
export type { CreateCompanyParams } from './createCompany';

export { getCompanyTool, handleGetCompany } from './getCompany';
export type { GetCompanyParams } from './getCompany';

export { searchCompaniesTool, handleSearchCompanies } from './searchCompanies';
export type { SearchCompaniesParams } from './searchCompanies';

export { updateCompanyTool, handleUpdateCompany } from './updateCompany';
export type { UpdateCompanyParams } from './updateCompany';

/** Ordered list of tool definitions for registration with OpenClaw */
export const toolDefinitions = [
  // Contacts
  (await import('./createContact')).createContactTool,
  (await import('./getContact')).getContactTool,
  (await import('./searchContacts')).searchContactsTool,
  (await import('./updateContact')).updateContactTool,
  (await import('./deleteContact')).deleteContactTool,
  // Companies
  (await import('./createCompany')).createCompanyTool,
  (await import('./getCompany')).getCompanyTool,
  (await import('./searchCompanies')).searchCompaniesTool,
  (await import('./updateCompany')).updateCompanyTool,
] as const;

/** Synchronous catalog of tool name → handler for the bridge dispatcher */
import { handleCreateContact } from './createContact';
import { handleGetContact } from './getContact';
import { handleSearchContacts } from './searchContacts';
import { handleUpdateContact } from './updateContact';
import { handleDeleteContact } from './deleteContact';
import { handleCreateCompany } from './createCompany';
import { handleGetCompany } from './getCompany';
import { handleSearchCompanies } from './searchCompanies';
import { handleUpdateCompany } from './updateCompany';

export const toolHandlers: Record<
  string,
  (params: any) => Promise<unknown>
> = {
  'crm.create_contact': handleCreateContact,
  'crm.get_contact': handleGetContact,
  'crm.search_contacts': handleSearchContacts,
  'crm.update_contact': handleUpdateContact,
  'crm.delete_contact': handleDeleteContact,
  'crm.create_company': handleCreateCompany,
  'crm.get_company': handleGetCompany,
  'crm.search_companies': handleSearchCompanies,
  'crm.update_company': handleUpdateCompany,
};

/** Static list of tool definition objects (no top-level await) for simple consumers */
import { createContactTool } from './createContact';
import { getContactTool } from './getContact';
import { searchContactsTool } from './searchContacts';
import { updateContactTool } from './updateContact';
import { deleteContactTool } from './deleteContact';
import { createCompanyTool } from './createCompany';
import { getCompanyTool } from './getCompany';
import { searchCompaniesTool } from './searchCompanies';
import { updateCompanyTool } from './updateCompany';

export const allTools = [
  createContactTool,
  getContactTool,
  searchContactsTool,
  updateContactTool,
  deleteContactTool,
  createCompanyTool,
  getCompanyTool,
  searchCompaniesTool,
  updateCompanyTool,
] as const;
