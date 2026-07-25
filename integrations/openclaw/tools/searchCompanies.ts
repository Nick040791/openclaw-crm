// OpenClaw tool definition + handler for searching companies

import companiesService from '../../../modules/companies/service';

export const searchCompaniesTool = {
  name: 'crm.search_companies',
  description:
    'Search companies by name, domain, or industry. Returns structured results for agent use.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search string or partial name/domain/industry',
      },
      limit: {
        type: 'number',
        default: 10,
        minimum: 1,
        maximum: 50,
        description: 'Max results to return',
      },
    },
    required: ['query'],
  },
} as const;

export type SearchCompaniesParams = {
  query: string;
  limit?: number;
};

export async function handleSearchCompanies(params: SearchCompaniesParams) {
  const limit = Math.min(Math.max(params.limit ?? 10, 1), 50);
  const results = await companiesService.search(params.query, limit);
  return {
    success: true,
    count: results.length,
    companies: results,
  };
}
