import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  TodoSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
  TodoIdSchema,
  CreateTodoWithFileSchema,
  TodoWithFileSchema,
} from '../schemas/todo.schema.js';

/**
 * Todo API contracts with OpenAPI routes
 * Each contract defines HTTP method, path, input validation, and output type
 */
export const todoContract = {
  /**
   * List all todos
   * GET /todos
   */
  list: oc
    .route({
      method: 'GET',
      path: '/todos',
      summary: 'List all todos',
      description: 'Retrieve all todo items',
      tags: ['Todos'],
    })
    .output(z.array(TodoSchema)),

  /**
   * Get a single todo by ID
   * GET /todos/{id}
   */
  get: oc
    .route({
      method: 'GET',
      path: '/todos/{id}',
      summary: 'Get todo by ID',
      description: 'Retrieve a single todo item by its ID',
      tags: ['Todos'],
    })
    .input(TodoIdSchema)
    .output(TodoSchema),

  /**
   * Create a new todo
   * POST /todos
   */
  create: oc
    .route({
      method: 'POST',
      path: '/todos',
      summary: 'Create todo',
      description: 'Create a new todo item',
      tags: ['Todos'],
    })
    .input(CreateTodoSchema)
    .output(TodoSchema),

  /**
   * Create a new todo with file upload
   * POST /todos/with-file
   */
  createWithFile: oc
    .route({
      method: 'POST',
      path: '/todos/with-file',
      summary: 'Create todo with file',
      description: 'Create a new todo item with an optional file attachment using multipart/form-data',
      tags: ['Todos'],
    })
    .input(
      z.object({
        data: z.string().transform((str) => {
          try {
            return JSON.parse(str);
          } catch {
            return str;
          }
        }).pipe(CreateTodoWithFileSchema),
        file: z.any(), // Handled by multer interceptor
      })
    )
    .output(TodoWithFileSchema),

  /**
   * Update an existing todo
   * PUT /todos/{id}
   */
  update: oc
    .route({
      method: 'PUT',
      path: '/todos/{id}',
      summary: 'Update todo',
      description: 'Update an existing todo item',
      tags: ['Todos'],
    })
    .input(
      z.object({
        id: z.coerce.number().int().positive(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional(),
        completed: z.boolean().optional(),
      })
    )
    .output(TodoSchema),

  /**
   * Delete a todo by ID
   * DELETE /todos/{id}
   */
  delete: oc
    .route({
      method: 'DELETE',
      path: '/todos/{id}',
      summary: 'Delete todo',
      description: 'Delete a todo item by its ID',
      tags: ['Todos'],
    })
    .input(TodoIdSchema)
    .output(z.object({ success: z.boolean(), id: z.number() })),
};