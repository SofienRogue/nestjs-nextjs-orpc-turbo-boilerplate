import { z } from 'zod';

/**
 * Base File schema matching FileDto and FileEntity
 */
export const FileSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  mimeType: z.string(),
});

/**
 * Schema for file ID parameter
 */
export const FileIdSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Schema for presigned URL response
 */
export const PresignedUrlResponseSchema = z.object({
  presignedUrl: z.string().url(),
  fileName: z.string().min(1),
});

/**
 * Schema for presigned URL request
 */
export const PresignedUrlRequestSchema = z.object({
  type: z.string().min(1),
});

/**
 * TypeScript types inferred from schemas
 */
export type File = z.infer<typeof FileSchema>;
export type FileIdInput = z.infer<typeof FileIdSchema>;
export type PresignedUrlResponse = z.infer<typeof PresignedUrlResponseSchema>;
export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>;
