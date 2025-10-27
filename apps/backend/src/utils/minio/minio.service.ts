import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { randomUUID } from 'crypto';
import { PresignedUrlResponseDto } from '../../files/dto/files.dto.js';
import * as Minio from 'minio'

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;
  private readonly bucket: string;
  private readonly endPoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor(
    @Inject('MINIO_CLIENT') minioProvider: { client: Minio.Client; bucket: string; endPoint: string; port: number; useSSL: boolean },
    private readonly i18n: I18nService,
  ) {
    this.minioClient = minioProvider.client;
    this.bucket = minioProvider.bucket;
    this.endPoint = minioProvider.endPoint;
    this.port = minioProvider.port;
    this.useSSL = minioProvider.useSSL;
  }

  private extractKeyFromUrl(url: string): string {
    const urlParts = new URL(url);
    return decodeURIComponent(urlParts.pathname.slice(1));
  }

  async getFileFromBucketByUrl(url: string): Promise<string> {
    const key = this.extractKeyFromUrl(url);
    return await this.getFileFromBucket(key);
  }

  async getFileFromBucket(key: string): Promise<string> {
    try {
      const stream = await this.minioClient.getObject(this.bucket, key);

      return await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () =>
          resolve(Buffer.concat(chunks).toString('base64')),
        );
        stream.on('error', reject);
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          errors: {
            file: this.i18n.t('file.failedUpload', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  /**
   * Upload or update file in bucket
   * @returns {Promise<string>} uploaded file location URL
   * @param {string} key  file key
   * @param {Buffer | Uint8Array | Blob | string | Readable} body file content
   * @param {string} contentType file content type
   */
  async uploadToBucket(
    key: string,
    body: Buffer | Uint8Array | Blob | string | Readable,
    contentType: string,
  ): Promise<string> {
    try {
      console.log('=== MINIO UPLOAD DEBUG ===');
      console.log('Bucket:', this.bucket);
      console.log('Key:', key);
      console.log('Content-Type:', contentType);
      console.log('Body type:', body.constructor.name);
      console.log('=========================');

      const metadata = {
        'Content-Type': contentType,
      };

      // If body is a Readable stream, collect it into a buffer first
      if (body instanceof Readable) {
        console.log('Converting stream to buffer...');
        const chunks: Buffer[] = [];
        
        await new Promise<void>((resolve, reject) => {
          body.on('data', (chunk) => {
            console.log('Received chunk:', chunk.length, 'bytes');
            chunks.push(Buffer.from(chunk));
          });
          body.on('end', () => {
            console.log('Stream ended. Total chunks:', chunks.length);
            resolve();
          });
          body.on('error', (err) => {
            console.error('Stream error:', err);
            reject(err);
          });
        });

        const buffer = Buffer.concat(chunks);
        console.log('Buffer size:', buffer.length, 'bytes');

        if (buffer.length === 0) {
          throw new HttpException(
            {
              status: HttpStatus.EXPECTATION_FAILED,
              errors: {
                stream: this.i18n.t('file.failedUpload', {
                  lang: I18nContext.current()?.lang,
                }),
              },
            },
            HttpStatus.EXPECTATION_FAILED,
          );
        }

        await this.minioClient.putObject(
          this.bucket,
          key,
          buffer,
          buffer.length,
          metadata,
        );
      } else {
        // For Buffer or other types
        const size = Buffer.isBuffer(body) ? body.length : undefined;
        await this.minioClient.putObject(
          this.bucket,
          key,
          body as Buffer,
          size,
          metadata,
        );
      }

      // Return the file location URL
      const protocol = this.useSSL ? 'https' : 'http';
      const location = `${protocol}://${this.endPoint}:${this.port}/${this.bucket}/${key}`;
      console.log('✓ Upload successful. Location:', location);
      return location;
    } catch (error) {
      console.error('=== MINIO UPLOAD ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('=========================');
      
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          errors: {
            file: this.i18n.t('file.failedUpload', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  /**
   * Delete file from bucket
   * @returns {Promise<boolean>} success deletion of the file
   * @param {string} key  file key
   */
  async deleteFromBucket(key: string): Promise<boolean> {
    try {
      await this.minioClient.removeObject(this.bucket, key);
      return true;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          errors: {
            file: this.i18n.t('file.failedDelete', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async checkIfFileExistsInBucket(url: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucket, this.extractKeyFromUrl(url));
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
        return false;
      }
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          errors: {
            minio: `Failed to check if file exists in bucket`,
          },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  async generatePresignedUrl(type: string): Promise<PresignedUrlResponseDto> {
    try {
      const fileName = randomUUID() + '.' + type;
      const presignedUrl = await this.minioClient.presignedPutObject(
        this.bucket,
        fileName,
        3600, // expires in 1 hour
      );
      return { presignedUrl, fileName };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          errors: {
            file: 'Failed to generate presigned URL',
          },
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
}
