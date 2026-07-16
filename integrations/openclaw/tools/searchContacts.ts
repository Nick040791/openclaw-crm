// Example OpenClaw tool definition for Contacts

export const searchContactsTool = {
  name: 'crm.search_contacts',
  description: 'Search contacts by name, email, company, or tags. Returns structured results for agent use.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search string or partial name/email' },
      limit: { type: 'number', default: 10, minimum: 1, maximum: 50 },
      tags: { type: 'array', items: { type: 'string' } }
    },
    required: ['query']
  },
  // In real impl, this would map to service call
} as const;

export type SearchContactsParams = {
  query: string;
  limit?: number;
  tags?: string[];
};