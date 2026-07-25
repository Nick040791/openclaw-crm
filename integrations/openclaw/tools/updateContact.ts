// OpenClaw tool definition + handler for updating a contact

import contactsService from '../../../modules/contacts/service';

export const updateContactTool = {
  name: 'crm.update_contact',
  description:
    'Update an existing contact by ID. Only provided fields are changed. Returns the updated contact. Prefer precise patches; avoid overwriting unknown fields.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Contact ID to update' },
      name: { type: 'string', description: 'Updated full name' },
      email: { type: 'string', format: 'email', description: 'Updated primary email' },
      phone: { type: 'string', description: 'Updated primary phone' },
      companyId: { type: 'string', description: 'Updated associated company ID' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Replacement tags array',
      },
      customFields: {
        type: 'object',
        description: 'Replacement or merged custom fields',
      },
    },
    required: ['id'],
  },
} as const;

export type UpdateContactParams = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  companyId?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
};

export async function handleUpdateContact(params: UpdateContactParams) {
  const { id, ...patch } = params;
  const contact = await contactsService.update(id, patch);
  if (!contact) {
    return {
      success: false,
      error: `Contact with ID ${id} not found`,
    };
  }
  return {
    success: true,
    contact,
    message: `Contact ${id} updated`,
  };
}
