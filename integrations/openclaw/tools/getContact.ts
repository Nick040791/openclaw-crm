// OpenClaw tool definition - Get single contact by ID

export const getContactTool = {
  name: 'crm.get_contact',
  description: 'Retrieve a single contact by its ID. Returns full contact details for agent context.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'UUID of the contact' }
    },
    required: ['id']
  }
} as const;

export type GetContactParams = {
  id: string;
};