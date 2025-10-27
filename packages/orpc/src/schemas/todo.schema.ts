import { z } from 'zod';

/**
 * Base Todo schema with all fields
 */
export const TodoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
});

/**
 * Schema for creating a new Todo (without id and createdAt)
 */
export const CreateTodoSchema = TodoSchema.omit({
  id: true,
  createdAt: true,
});

/**
 * Schema for updating a Todo (all fields optional except id)
 */
export const UpdateTodoSchema = TodoSchema.partial().required({ id: true });

/**
 * Schema for Todo ID parameter
 */
export const TodoIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Schema for creating a Todo with file upload
 */
export const CreateTodoWithFileSchema = CreateTodoSchema;

/**
 * Schema for Todo with file metadata
 */
export const TodoWithFileSchema = TodoSchema.extend({
  file: z.object({
    originalName: z.string(),
    mimetype: z.string(),
    size: z.number(),
  }).nullable(),
});

/**
 * TypeScript types inferred from schemas
 */
export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type TodoIdInput = z.infer<typeof TodoIdSchema>;
export type CreateTodoWithFileInput = z.infer<typeof CreateTodoWithFileSchema>;
export type TodoWithFile = z.infer<typeof TodoWithFileSchema>;