// OpenClaw tool definition for creating a new contact
// Aligns with modules/contacts/schema.ts for consistency

export const createContactTool = {
  name: 'crm.create_contact',
  description: 'Create a new contact record. Returns the created contact ID for follow-up actions. Privacy-first: all fields optional except name.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Full name of the contact' },
      email: { type: 'string', format: 'email', description: 'Primary email' },
      phone: { type: 'string', description: 'Primary phone number' },
      companyId: { type: 'string', description: 'UUID of associated company' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
      customFields: { type: 'object', description: 'Flexible additional data' }
    },
    required: ['name']
  }
} as const;

export type CreateContactParams = {
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
};

// Note: In full implementation, this would validate against Zod schema and call service layer.