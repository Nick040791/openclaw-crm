// OpenClaw tool definition + handler for updating a company

import companiesService from '../../../modules/companies/service';

export const updateCompanyTool = {
  name: 'crm.update_company',
  description:
    'Update an existing company by ID. Only provided fields are changed. Returns the updated company.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Company ID to update' },
      name: { type: 'string', description: 'Updated company name' },
      domain: { type: 'string', description: 'Updated domain or website' },
      industry: { type: 'string', description: 'Updated industry sector' },
      size: {
        type: 'string',
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
        description: 'Updated company size range',
      },
      customFields: {
        type: 'object',
        description: 'Replacement or merged custom fields',
      },
    },
    required: ['id'],
  },
} as const;

export type UpdateCompanyParams = {
  id: string;
  name?: string;
  domain?: string;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  customFields?: Record<string, unknown>;
};

export async function handleUpdateCompany(params: UpdateCompanyParams) {
  const { id, ...patch } = params;
  const company = await companiesService.update(id, patch);
  if (!company) {
    return {
      success: false,
      error: `Company with ID ${id} not found`,
    };
  }
  return {
    success: true,
    company,
    message: `Company ${id} updated`,
  };
}
