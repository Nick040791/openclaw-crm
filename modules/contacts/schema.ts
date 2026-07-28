import { z } from 'zod';

/**
 * Contact schema — privacy-first, minimal required fields.
 * IDs are opaque strings (service generates contact_<ts>_<rand> today;
 * future Drizzle/Postgres can switch to UUIDs without breaking the public shape).
 */
export const ContactSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  companyId: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

export const CreateContactSchema = ContactSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateContactSchema = ContactSchema.partial().omit({ id: true });
