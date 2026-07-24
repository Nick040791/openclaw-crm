// OpenClaw tool definition for creating a new company
// Aligns with modules/companies/schema.ts for consistency

export const createCompanyTool = {
  name: 'crm.create_company',
  description: 'Create a new company record. Returns the created company ID. Privacy-first: minimal required fields.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Company name' },
      domain: { type: 'string', description: 'Company domain or website' },
      industry: { type: 'string', description: 'Industry sector' },
      size: { type: 'string', enum: ['1-10', '11-50', '51-200', '201-500', '500+'], description: 'Company size range' },
      customFields: { type: 'object', description: 'Flexible additional data' }
    },
    required: ['name']
  }
} as const;

export type CreateCompanyParams = {
  name: string;
  domain?: string;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  customFields?: Record<string, any>;
};

// Note: In full implementation, this would validate against Zod schema and call service layer.