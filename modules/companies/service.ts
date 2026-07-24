import { Company, CreateCompanySchema, UpdateCompanySchema } from './schema';

// Basic in-memory store for development (replace with Drizzle/Postgres repo later)
let companies: Company[] = [];

let nextId = 1;

export const companiesService = {
  async create(data: any): Promise<Company> {
    const validated = CreateCompanySchema.parse(data);
    const company: Company = {
      id: `company_${Date.now()}`, // UUID in prod
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    companies.push(company);
    return company;
  },

  async get(id: string): Promise<Company | null> {
    return companies.find(c => c.id === id) || null;
  },

  async search(query: string = '', limit = 10): Promise<Company[]> {
    const q = query.toLowerCase();
    return companies
      .filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.domain && c.domain.toLowerCase().includes(q))
      )
      .slice(0, limit);
  },

  async update(id: string, data: any): Promise<Company | null> {
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;

    const validated = UpdateCompanySchema.parse(data);
    companies[index] = {
      ...companies[index],
      ...validated,
      updatedAt: new Date(),
    };
    return companies[index];
  },

  async list(limit = 20): Promise<Company[]> {
    return companies.slice(0, limit);
  }
};

export default companiesService;