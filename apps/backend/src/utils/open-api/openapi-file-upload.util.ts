import { INestApplication } from '@nestjs/common';
import { FILE_UPLOAD_METADATA_KEY, FileUploadMetadata, AdditionalField } from './file-upload.decorator.js';
import { getSchemaPath } from '@nestjs/swagger';

interface FileUploadRoute {
  path: string;
  method: string;
  metadata: FileUploadMetadata;
}

/**
 * Scans the NestJS application for routes decorated with @FileUpload
 * and returns their metadata
 */
export function scanFileUploadRoutes(app: INestApplication): FileUploadRoute[] {
  const routes: FileUploadRoute[] = [];
  const server = app.getHttpServer();
  const router = server._events.request._router;

  // Get all controllers
  const modules = (app as any).container?.getModules();
  if (!modules) return routes;

  modules.forEach((module: any) => {
    const controllers = module.controllers;
    if (!controllers) return;

    controllers.forEach((controller: any) => {
      const instance = controller.instance;
      if (!instance) return;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== 'constructor' && typeof prototype[name] === 'function'
      );

      methodNames.forEach((methodName) => {
        const metadata: FileUploadMetadata = Reflect.getMetadata(
          FILE_UPLOAD_METADATA_KEY,
          prototype[methodName]
        );

        if (metadata) {
          // Get route metadata
          const path = Reflect.getMetadata('path', prototype[methodName]);
          const method = Reflect.getMetadata('method', prototype[methodName]);

          if (path !== undefined && method !== undefined) {
            routes.push({
              path: typeof path === 'string' ? path : '',
              method: typeof method === 'string' ? method.toLowerCase() : 'post',
              metadata,
            });
          }
        }
      });
    });
  });

  return routes;
}

/**
 * Configures OpenAPI spec for file upload endpoints
 */
export function configureFileUploadOpenAPI(
  openAPISpec: any,
  routes: FileUploadRoute[],
  allowedFileTypes: string,
  allowedMimeTypes: string
): void {
  // Ensure components.schemas exists
  if (!openAPISpec.components) {
    openAPISpec.components = {};
  }
  if (!openAPISpec.components.schemas) {
    openAPISpec.components.schemas = {};
  }

  routes.forEach(({ path, method, metadata }) => {
    const endpoint = openAPISpec.paths?.[path]?.[method];
    if (!endpoint) return;

    const { fieldName, isArray, maxItems, additionalFields } = metadata;

    const description = isArray
      ? `Files to upload${maxItems ? ` (max ${maxItems})` : ''} - Allowed: ${allowedFileTypes}`
      : `File to upload (${allowedFileTypes})`;

    const fileProperty = isArray
      ? {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description,
          ...(maxItems && { maxItems }),
        }
      : {
          type: 'string',
          format: 'binary',
          description,
        };

    // Build properties object with file field
    const properties: Record<string, any> = {
      [fieldName]: fileProperty,
    };

    // Build required fields array
    const required: string[] = [fieldName];

    // Add additional fields if specified
    if (additionalFields && additionalFields.length > 0) {
      additionalFields.forEach((field: AdditionalField) => {
        let fieldSchema: any;

        if (field.type === 'object' && field.schema) {
          // For complex objects, we need to handle it as a string in FormData
          // because FormData can only send strings for non-file fields
          const schemaName = field.schema.name || 'UnknownSchema';
          
          // Register the schema if it has a zodSchema property (for Zod DTOs)
          if (field.schema.zodSchema) {
            // The schema will be auto-registered by nestjs-zod or we reference it
            fieldSchema = {
              type: 'string',
              description: `${field.description || ''} (JSON string conforming to ${schemaName} schema)`,
            };
          } else {
            // Fallback for non-Zod schemas
            fieldSchema = {
              type: 'string',
              description: field.description || `JSON string for ${schemaName}`,
            };
          }
        } else {
          // For simple types
          fieldSchema = {
            type: field.type,
            description: field.description,
          };
        }

        properties[field.name] = fieldSchema;

        if (field.required) {
          required.push(field.name);
        }
      });
    }

    endpoint.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties,
            required,
          },
          encoding: {
            [fieldName]: {
              contentType: allowedMimeTypes,
            },
          },
        },
      },
    };

    // Add success response description
    if (endpoint.responses?.['200']) {
      endpoint.responses['200'].description = 'File uploaded successfully';
    }
  });
}
