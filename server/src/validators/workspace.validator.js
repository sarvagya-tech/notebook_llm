import { z } from 'zod';

export const CHAT_MODELS = ['gpt-4o-mini', 'gpt-4o'];

export const createWorkspaceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(8).optional(),
  defaultModel: z.enum(CHAT_MODELS).optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);
/*
. .partial() (Makes everything optional)
By default, createWorkspaceSchema requires a title. Applying .partial() 
creates a new schema where every single field (title, description, icon, defaultModel) 
becomes optional (.optional()). 
This is perfect for an update/PATCH request, 
where a user might only want to change their icon without re-sending 
the title.2. .refine() (Adds a custom check)Since everything is now optional, 
a user could accidentally send a completely empty request {}. 
The .refine() method allows you to write a custom JavaScript function to block this
.(data) => Object.keys(data).length > 0: This function takes the incoming data and
 checks how many keys (fields) it has. If the count is greater than 0, validation passes. 
 If it is 0 (empty object), validation fails.{ message: 'At least one field is required' }: 
 This is the custom error message Zod will return if the validation fails.
*/

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().trim().min(1),
});
