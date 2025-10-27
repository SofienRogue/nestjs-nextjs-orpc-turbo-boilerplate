import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  FileSchema,
  FileIdSchema,
  PresignedUrlResponseSchema,
  PresignedUrlRequestSchema,
} from '../schemas/file.schema.js';

/**
 * File API contracts with OpenAPI routes
 * Each contract defines HTTP method, path, input validation, and output type
 */
export const fileContract = {
  /**
   * List all files with pagination
   * GET /files
   */
  list: oc
    .route({
      method: 'GET',
      path: '/files',
      summary: 'List all files',
      description: 'Retrieve paginated list of files',
      tags: ['Files'],
    })
    .input(
      z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        sortBy: z.array(z.string()).optional(),
        filter: z.record(z.string()).optional(),
      })
    )
    .output(
      z.object({
        data: z.array(FileSchema),
        meta: z.object({
          totalItems: z.number(),
          itemCount: z.number(),
          itemsPerPage: z.number(),
          totalPages: z.number(),
          currentPage: z.number(),
        }),
        links: z
          .object({
            first: z.string().optional(),
            previous: z.string().optional(),
            current: z.string(),
            next: z.string().optional(),
            last: z.string().optional(),
          })
          .optional(),
      })
    ),

  /**
   * Get a single file by ID
   * GET /files/{id}
   */
  get: oc
    .route({
      method: 'GET',
      path: '/files/{id}',
      summary: 'Get file by ID',
      description: 'Retrieve a single file by its ID',
      tags: ['Files'],
    })
    .input(FileIdSchema)
    .output(FileSchema.nullable()),

  /**
   * Upload a single file
   * POST /files/upload
   */
  upload: oc
    .route({
      method: 'POST',
      path: '/files/upload',
      summary: 'Upload file',
      description: 'Upload a single file using multipart/form-data',
      tags: ['Files'],
    })
    .input(
      z.object({
        file: z.any(), // Handled by multer interceptor
      })
    )
    .output(FileSchema),

  /**
   * Upload multiple files
   * POST /files/upload-multiple
   */
  uploadMultiple: oc
    .route({
      method: 'POST',
      path: '/files/upload-multiple',
      summary: 'Upload multiple files',
      description: 'Upload multiple files (max 10) using multipart/form-data',
      tags: ['Files'],
    })
    .input(
      z.object({
        files: z.any(), // Handled by multer interceptor
      })
    )
    .output(z.array(FileSchema)),

  /**
   * Update an existing file
   * PUT /files/{id}
   */
  update: oc
    .route({
      method: 'PUT',
      path: '/files/{id}',
      summary: 'Update file',
      description: 'Update an existing file by uploading a new version',
      tags: ['Files'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        file: z.any(), // Handled by multer interceptor
      })
    )
    .output(FileSchema),

  /**
   * Delete a file by ID
   * DELETE /files/{id}
   */
  delete: oc
    .route({
      method: 'DELETE',
      path: '/files/{id}',
      summary: 'Delete file',
      description: 'Delete a file by its ID',
      tags: ['Files'],
    })
    .input(FileIdSchema)
    .output(
      z.object({
        affected: z.number().optional(),
        raw: z.any(),
      })
    ),

  /**
   * Get presigned URL for file upload
   * GET /files/presigned/{type}
   */
  getPresignedUrl: oc
    .route({
      method: 'GET',
      path: '/files/presigned/{type}',
      summary: 'Get presigned URL',
      description: 'Generate a presigned URL for direct file upload',
      tags: ['Files'],
    })
    .input(PresignedUrlRequestSchema)
    .output(PresignedUrlResponseSchema),
};
