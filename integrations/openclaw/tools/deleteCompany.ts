// OpenClaw tool definition + handler for deleting a company (privacy-first)

import companiesService from '../../../modules/companies/service';

export const deleteCompanyTool = {
  name: 'crm.delete_company',
  description:
    'Permanently delete a company by ID. Use only when the user or policy explicitly requests removal. This supports privacy and data-minimization goals. Prefer soft-delete patterns in production later; current in-memory store hard-deletes. Does not cascade-delete associated contacts (contacts retain companyId until updated).',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Company ID to delete' },
      confirm: {
        type: 'boolean',
        description: 'Must be true to proceed with deletion (safety guard)',
      },
    },
    required: ['id', 'confirm'],
  },
} as const;

export type DeleteCompanyParams = {
  id: string;
  confirm: boolean;
};

export async function handleDeleteCompany(params: DeleteCompanyParams) {
  if (!params.confirm) {
    return {
      success: false,
      error: 'Deletion requires confirm: true. No action taken.',
    };
  }
  const deleted = await companiesService.delete(params.id);
  if (!deleted) {
    return {
      success: false,
      error: `Company with ID ${params.id} not found`,
    };
  }
  return {
    success: true,
    message: `Company ${params.id} deleted`,
  };
}
