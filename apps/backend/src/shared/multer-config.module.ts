import { Global, HttpException, HttpStatus, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type.js';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { MinioService } from '../utils/minio/minio.service.js';

/**
 * Global Multer configuration module
 * Provides file upload handling for both local and MinIO storage
 * Can be imported by any module that needs file upload functionality
 */
@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService, MinioService],
      useFactory: (
        configService: ConfigService<AllConfigType>,
        minioService: MinioService
      ) => {
        const storages = {
          local: () =>
            diskStorage({
              destination: './uploads',
              filename: (request, file, callback) => {
                callback(
                  null,
                  `${randomUUID()}.${file.originalname
                    .split('.')
                    .pop()
                    ?.toLowerCase()}`,
                );
              },
            }),
          minio: () => {
            // Helper to get extension from mimetype
            const getExtensionFromMimetype = (mimetype: string): string => {
              const mimetypeMap: Record<string, string> = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/avif': 'avif',
                'image/webp': 'webp',
                'application/pdf': 'pdf',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
                'application/vnd.ms-excel': 'xls',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
                'application/msword': 'doc',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
                'application/vnd.ms-powerpoint': 'ppt',
                'application/octet-stream': 'bin',
              };
              return mimetypeMap[mimetype] || 'bin';
            };

            return {
              _handleFile: (
                request: any,
                file: Express.Multer.File & { location?: string; key?: string; bucket?: string },
                callback: (error: Error | null, info?: Partial<Express.Multer.File>) => void,
              ) => {
                console.log("minio file", file);
                // Get extension from filename or fall back to mimetype
                let extension = file.originalname.split('.').pop()?.toLowerCase();
                
                // If no extension or generic filename, use mimetype
                if (!extension || extension === file.originalname.toLowerCase() || file.originalname === 'filename') {
                  extension = getExtensionFromMimetype(file.mimetype);
                  console.log(`Using extension from mimetype: ${extension}`);
                }
                
                const fileKey = `${randomUUID()}.${extension}`;
                console.log("upload fileKey", fileKey);
                minioService
                  .uploadToBucket(fileKey, file.stream, file.mimetype)
                  .then((location) => {
                    console.log("✓ MinIO upload successful, setting file properties");
                    callback(null, {
                      filename: fileKey,
                      location: location,
                      key: fileKey,
                      bucket: minioService['bucket'],
                      size: 0,
                    } as any);
                  })
                  .catch((error) => {
                    console.log("upload error", error);
                    callback(error);
                  });
              },
              _removeFile: (
                request: any,
                file: Express.Multer.File & { key?: string },
                callback: (error: Error | null) => void,
              ) => {
                if (file.key) {
                  minioService
                    .deleteFromBucket(file.key)
                    .then(() => callback(null))
                    .catch((error) => {
                      console.log("delete error", error);
                      callback(error);
                    });
                } else {
                  callback(null);
                }
              },
            };
          },
        };

        return {
          fileFilter: (request, file, callback) => {
            console.log('=== FILE FILTER DEBUG ===');
            console.log('File object:', JSON.stringify({
              fieldname: file.fieldname,
              originalname: file.originalname,
              encoding: file.encoding,
              mimetype: file.mimetype,
            }, null, 2));
            console.log('========================');

            const allowedExtensions =
              /\.(jpg|jpeg|png|avif|webp|pdf|xlsx|xls|docx|doc|pptx|ppt)$/i;
            
            const allowedMimeTypes = [
              'image/jpeg',
              'image/jpg', 
              'image/png',
              'image/avif',
              'image/webp',
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'application/vnd.ms-powerpoint',
            ];

            if (!file.originalname) {
              console.error('ERROR: No originalname found on file object');
              return callback(
                new HttpException(
                  {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                      file: `noFileProvided`,
                    },
                  },
                  HttpStatus.UNPROCESSABLE_ENTITY,
                ),
                false,
              );
            }

            const hasValidExtension = file.originalname.match(allowedExtensions);
            
            if (!hasValidExtension) {
              console.log(`⚠ No valid extension in filename: ${file.originalname}, checking mimetype...`);
              
              if (file.mimetype === 'application/octet-stream') {
                console.log('⚠ WARNING: Received generic mimetype (application/octet-stream).');
                console.log('⚠ This usually means Scalar/Swagger UI could not determine the file type.');
                console.log('⚠ Allowing upload, but consider using curl or Postman for better file type detection.');
              } else if (!allowedMimeTypes.includes(file.mimetype)) {
                console.error(`ERROR: File type not allowed. Mimetype: ${file.mimetype}`);
                return callback(
                  new HttpException(
                    {
                      status: HttpStatus.UNPROCESSABLE_ENTITY,
                      errors: {
                        file: `cantUploadFileType`,
                      },
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY,
                  ),
                  false,
                );
              }
              
              console.log(`✓ File validation passed via mimetype: ${file.mimetype}`);
            } else {
              console.log(`✓ File validation passed via extension: ${file.originalname}`);
            }

            callback(null, true);
          },
          storage: storages[configService.getOrThrow('file.driver', { infer: true })](),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
  ],
  exports: [MulterModule],
})
export class MulterConfigModule {}
