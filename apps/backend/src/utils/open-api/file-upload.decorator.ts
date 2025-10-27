import { SetMetadata } from '@nestjs/common';
import { Type } from '@nestjs/common';

export const FILE_UPLOAD_METADATA_KEY = 'fileUpload';

export interface AdditionalField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
  schema?: any; // For complex objects, reference to DTO class
}

export interface FileUploadMetadata {
  fieldName: string;
  isArray: boolean;
  maxItems?: number;
  additionalFields?: AdditionalField[];
}

/**
 * Decorator to mark a route as a file upload endpoint
 * This metadata is used to automatically configure OpenAPI spec
 * 
 * @param fieldName - The name of the form field (e.g., 'file', 'files')
 * @param options - Additional options for file upload
 * 
 * @example
 * ```typescript
 * // Simple file upload
 * @FileUpload('file')
 * @UseInterceptors(FileInterceptor('file'))
 * uploadFile(@UploadedFile() file: Express.Multer.File) { ... }
 * 
 * // Multiple files
 * @FileUpload('files', { isArray: true, maxItems: 10 })
 * @UseInterceptors(FilesInterceptor('files', 10))
 * uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) { ... }
 * 
 * // File with additional FormData fields
 * @FileUpload('file', {
 *   additionalFields: [
 *     { name: 'data', type: 'object', schema: CreateTodoDto, required: true, description: 'Todo data as JSON' }
 *   ]
 * })
 * @UseInterceptors(FileInterceptor('file'))
 * uploadWithData(@UploadedFile() file, @Body('data') data) { ... }
 * ```
 */
export const FileUpload = (
  fieldName: string,
  options: { 
    isArray?: boolean; 
    maxItems?: number;
    additionalFields?: AdditionalField[];
  } = {}
) => {
  const metadata: FileUploadMetadata = {
    fieldName,
    isArray: options.isArray ?? false,
    maxItems: options.maxItems,
    additionalFields: options.additionalFields,
  };
  return SetMetadata(FILE_UPLOAD_METADATA_KEY, metadata);
};
