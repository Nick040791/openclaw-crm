// OpenClaw tool: list contacts belonging to a company (relationship helper)
// Read-only; supports agent workflows such as "who works at Acme?"

import contactsService from '../../../modules/contacts/service';

export const listContactsByCompanyTool = {
  name: 'crm.list_contacts_by_company',
  description:
    'List contacts associated with a given company ID. Useful for answering "who works at this company?" or preparing outreach lists. Returns up to `limit` contacts (default 20, max 50). Read-only; does not expose data beyond existing contact fields.',
  parameters: {
    type: 'object',
    properties: {
      companyId: {
        type: 'string',
        description: 'Company ID whose contacts should be returned',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of contacts to return (1–50)',
        default: 20,
        minimum: 1,
        maximum: 50,
      },
    },
    required: ['companyId'],
  },
} as const;

export type ListContactsByCompanyParams = {
  companyId: string;
  limit?: number;
};

export async function handleListContactsByCompany(
  params: ListContactsByCompanyParams
) {
  const companyId = params.companyId?.trim();
  if (!companyId) {
    return {
      success: false,
      error: 'companyId is required',
    };
  }

  const limit =
    typeof params.limit === 'number' && !Number.isNaN(params.limit)
      ? params.limit
      : 20;

  const contacts = await contactsService.listByCompanyId(companyId, limit);

  return {
    success: true,
    companyId,
    count: contacts.length,
    contacts,
    message:
      contacts.length === 0
        ? `No contacts found for company ${companyId}`
        : `Found ${contacts.length} contact(s) for company ${companyId}`,
  };
}
