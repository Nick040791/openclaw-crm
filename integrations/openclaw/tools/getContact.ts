// Enhanced OpenClaw tool definition integrating with Contacts service
import contactsService from '../../../modules/contacts/service';

export const getContactTool = {
  name: 'crm.get_contact',
  description: 'Retrieve a specific contact by ID. Returns full details for agent context. Privacy-first: scoped access.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Contact ID' }
    },
    required: ['id']
  }
} as const;

export type GetContactParams = {
  id: string;
};

// Example handler for bridge (to be used in full implementation)
export async function handleGetContact(params: GetContactParams) {
  const contact = await contactsService.get(params.id);
  if (!contact) {
    throw new Error(`Contact with ID ${params.id} not found`);
  }
  return contact;
}
