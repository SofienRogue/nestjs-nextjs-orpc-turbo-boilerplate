import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type.js';
import { AppConfig } from './config/app-config.type.js';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { contract } from '@workspace/orpc';
import { apiReference } from '@scalar/nestjs-api-reference';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  // Create app with body parser enabled
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  // Enable CORS for frontend access
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Create OpenAPI generator for oRPC contracts
  const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  // Generate OpenAPI specification from oRPC contracts
  const openAPISpec = await openAPIGenerator.generate(contract, {
    info: {
      title: 'Tech Docs Turbo API',
      version: '1.0.0',
      description: 'API documentation for Tech Docs Turbo backend (v1)',
    },
    servers: [
      {
        url: `http://localhost:${process.env.APP_PORT ?? 5010}/api`,
        description: 'Development server',
      },
    ],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  });

  // Automatically configure file upload endpoints using @FileUpload decorator metadata
  // No need to hardcode routes - they are detected automatically!
  const allowedFileTypes = 'jpg, jpeg, png, avif, webp, pdf, xlsx, xls, docx, doc, pptx, ppt';
  const allowedMimeTypes = 'image/png, image/jpeg, image/jpg, image/avif, image/webp, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.ms-powerpoint';

  // Scan all routes decorated with @FileUpload and configure them automatically
  const { scanFileUploadRoutes, configureFileUploadOpenAPI } = await import('./utils/open-api/openapi-file-upload.util.js');
  const fileUploadRoutes = scanFileUploadRoutes(app);
  configureFileUploadOpenAPI(openAPISpec, fileUploadRoutes, allowedFileTypes, allowedMimeTypes);

  // Serve OpenAPI spec at /api/spec.json
  app.use('/api/spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(openAPISpec));
  });

  // Serve Scalar API reference UI at /api-docs
  app.use(
    '/api-docs',
    apiReference({
      theme: 'moon',
      url: '/api/spec.json',
      favicon: 'https://avatars.githubusercontent.com/u/301879?s=48&v=4',
    }),
  );

  const port = configService.getOrThrow<AppConfig>('app', { infer: true }).port ?? 5010;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
  console.log(`📄 OpenAPI Spec available at http://localhost:${port}/api/spec.json`);
}
bootstrap();

