import { Contact, CreateContactSchema, UpdateContactSchema } from './schema';

// Basic in-memory store for development (replace with Drizzle/Postgres repo later)
let contacts: Contact[] = [];

let nextId = 1;

export const contactsService = {
  async create(data: any): Promise<Contact> {
    const validated = CreateContactSchema.parse(data);
    const contact: Contact = {
      id: `contact_${Date.now()}`, // UUID in prod
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    contacts.push(contact);
    return contact;
  },

  async get(id: string): Promise<Contact | null> {
    return contacts.find(c => c.id === id) || null;
  },

  async search(query: string = '', limit = 10): Promise<Contact[]> {
    const q = query.toLowerCase();
    return contacts
      .filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.email && c.email.toLowerCase().includes(q))
      )
      .slice(0, limit);
  },

  async update(id: string, data: any): Promise<Contact | null> {
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    const validated = UpdateContactSchema.parse(data);
    contacts[index] = {
      ...contacts[index],
      ...validated,
      updatedAt: new Date(),
    };
    return contacts[index];
  },

  async list(limit = 20): Promise<Contact[]> {
    return contacts.slice(0, limit);
  }
};

export default contactsService;