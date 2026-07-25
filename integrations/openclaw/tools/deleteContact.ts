// OpenClaw tool definition + handler for deleting a contact (privacy-first)

import contactsService from '../../../modules/contacts/service';

export const deleteContactTool = {
  name: 'crm.delete_contact',
  description:
    'Permanently delete a contact by ID. Use only when the user or policy explicitly requests removal. This supports privacy and data-minimization goals. Prefer soft-delete patterns in production later; current in-memory store hard-deletes.',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Contact ID to delete' },
      confirm: {
        type: 'boolean',
        description: 'Must be true to proceed with deletion (safety guard)',
      },
    },
    required: ['id', 'confirm'],
  },
} as const;

export type DeleteContactParams = {
  id: string;
  confirm: boolean;
};

export async function handleDeleteContact(params: DeleteContactParams) {
  if (!params.confirm) {
    return {
      success: false,
      error: 'Deletion requires confirm: true. No action taken.',
    };
  }
  const deleted = await contactsService.delete(params.id);
  if (!deleted) {
    return {
      success: false,
      error: `Contact with ID ${params.id} not found`,
    };
  }
  return {
    success: true,
    message: `Contact ${params.id} deleted`,
  };
}
