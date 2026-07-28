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

export {
  listContactsByCompanyTool,
  handleListContactsByCompany,
} from './listContactsByCompany';
export type { ListContactsByCompanyParams } from './listContactsByCompany';

export { createCompanyTool, handleCreateCompany } from './createCompany';
export type { CreateCompanyParams } from './createCompany';

export { getCompanyTool, handleGetCompany } from './getCompany';
export type { GetCompanyParams } from './getCompany';

export { searchCompaniesTool, handleSearchCompanies } from './searchCompanies';
export type { SearchCompaniesParams } from './searchCompanies';

export { updateCompanyTool, handleUpdateCompany } from './updateCompany';
export type { UpdateCompanyParams } from './updateCompany';

export { deleteCompanyTool, handleDeleteCompany } from './deleteCompany';
export type { DeleteCompanyParams } from './deleteCompany';

import { createContactTool, handleCreateContact } from './createContact';
import { getContactTool, handleGetContact } from './getContact';
import { searchContactsTool, handleSearchContacts } from './searchContacts';
import { updateContactTool, handleUpdateContact } from './updateContact';
import { deleteContactTool, handleDeleteContact } from './deleteContact';
import {
  listContactsByCompanyTool,
  handleListContactsByCompany,
} from './listContactsByCompany';
import { createCompanyTool, handleCreateCompany } from './createCompany';
import { getCompanyTool, handleGetCompany } from './getCompany';
import { searchCompaniesTool, handleSearchCompanies } from './searchCompanies';
import { updateCompanyTool, handleUpdateCompany } from './updateCompany';
import { deleteCompanyTool, handleDeleteCompany } from './deleteCompany';

/** Synchronous map of tool name → handler for the bridge dispatcher */
export const toolHandlers: Record<string, (params: any) => Promise<unknown>> = {
  'crm.create_contact': handleCreateContact,
  'crm.get_contact': handleGetContact,
  'crm.search_contacts': handleSearchContacts,
  'crm.update_contact': handleUpdateContact,
  'crm.delete_contact': handleDeleteContact,
  'crm.list_contacts_by_company': handleListContactsByCompany,
  'crm.create_company': handleCreateCompany,
  'crm.get_company': handleGetCompany,
  'crm.search_companies': handleSearchCompanies,
  'crm.update_company': handleUpdateCompany,
  'crm.delete_company': handleDeleteCompany,
};

/** Ordered list of tool definition objects for registration with OpenClaw */
export const allTools = [
  createContactTool,
  getContactTool,
  searchContactsTool,
  updateContactTool,
  deleteContactTool,
  listContactsByCompanyTool,
  createCompanyTool,
  getCompanyTool,
  searchCompaniesTool,
  updateCompanyTool,
  deleteCompanyTool,
] as const;

export type ToolName = keyof typeof toolHandlers;
