// OpenClaw tool definition + handler for creating a new contact
// Aligns with modules/contacts/schema.ts for consistency

import contactsService from '../../../modules/contacts/service';

export const createContactTool = {
  name: 'crm.create_contact',
  description:
    'Create a new contact record. Returns the created contact (including ID) for follow-up actions. Privacy-first: only name is required; all other fields optional. Agent actions are intended to be audited.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Full name of the contact' },
      email: { type: 'string', format: 'email', description: 'Primary email' },
      phone: { type: 'string', description: 'Primary phone number' },
      companyId: { type: 'string', description: 'ID of associated company' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for categorization',
      },
      customFields: {
        type: 'object',
        description: 'Flexible additional data (key-value)',
      },
    },
    required: ['name'],
  },
} as const;

export type CreateContactParams = {
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
};

/** Handler: validates via service Zod schema and persists */
export async function handleCreateContact(params: CreateContactParams) {
  const contact = await contactsService.create(params);
  return {
    success: true,
    contact,
    message: `Contact created with id ${contact.id}`,
  };
}
