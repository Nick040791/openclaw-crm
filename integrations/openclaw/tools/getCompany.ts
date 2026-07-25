// OpenClaw tool definition + handler for retrieving a company by ID

import companiesService from '../../../modules/companies/service';

export const getCompanyTool = {
  name: 'crm.get_company',
  description:
    'Retrieve a specific company by ID. Returns full details for agent context.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Company ID' },
    },
    required: ['id'],
  },
} as const;

export type GetCompanyParams = {
  id: string;
};

export async function handleGetCompany(params: GetCompanyParams) {
  const company = await companiesService.get(params.id);
  if (!company) {
    return {
      success: false,
      error: `Company with ID ${params.id} not found`,
    };
  }
  return {
    success: true,
    company,
  };
}
