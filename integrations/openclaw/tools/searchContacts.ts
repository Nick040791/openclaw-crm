// OpenClaw tool definition + handler for searching contacts

import contactsService from '../../../modules/contacts/service';

export const searchContactsTool = {
  name: 'crm.search_contacts',
  description:
    'Search contacts by name, email, phone, or tags. Returns structured results for agent use. Prefer this over listing all contacts.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search string or partial name/email/phone/tag',
      },
      limit: {
        type: 'number',
        default: 10,
        minimum: 1,
        maximum: 50,
        description: 'Max results to return',
      },
    },
    required: ['query'],
  },
} as const;

export type SearchContactsParams = {
  query: string;
  limit?: number;
};

/** Handler: performs case-insensitive search via service */
export async function handleSearchContacts(params: SearchContactsParams) {
  const limit = Math.min(Math.max(params.limit ?? 10, 1), 50);
  const results = await contactsService.search(params.query, limit);
  return {
    success: true,
    count: results.length,
    contacts: results,
  };
}
