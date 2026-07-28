import { z } from 'zod';

/**
 * Company schema — privacy-first, minimal required fields.
 * IDs are opaque strings (service generates company_<ts>_<rand> today;
 * future Drizzle/Postgres can switch to UUIDs without breaking the public shape).
 */
export const CompanySchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  customFields: z.record(z.any()).default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Company = z.infer<typeof CompanySchema>;

export const CreateCompanySchema = CompanySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCompanySchema = CompanySchema.partial().omit({ id: true });
