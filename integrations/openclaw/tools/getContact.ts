// OpenClaw tool definition + handler for retrieving a contact by ID

import contactsService from '../../../modules/contacts/service';

export const getContactTool = {
  name: 'crm.get_contact',
  description:
    'Retrieve a specific contact by ID. Returns full details for agent context. Privacy-first: scoped to provided ID only.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Contact ID' },
    },
    required: ['id'],
  },
} as const;

export type GetContactParams = {
  id: string;
};

export async function handleGetContact(params: GetContactParams) {
  const contact = await contactsService.get(params.id);
  if (!contact) {
    return {
      success: false,
      error: `Contact with ID ${params.id} not found`,
    };
  }
  return {
    success: true,
    contact,
  };
}
