import { z } from 'zod';

export const ContactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  companyId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

export const CreateContactSchema = ContactSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const UpdateContactSchema = ContactSchema.partial().omit({ id: true });