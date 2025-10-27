import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity.js';
import {
  DataSource,
  DeleteResult,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { AllConfigType } from '../config/config.type.js';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { FilesDto, PresignedUrlResponseDto } from './dto/files.dto.js';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { filePaginationConfig } from './config/files-pagination.config.js';
import { FileDriver } from './file-driver.enum.js';
import { MinioService } from '../utils/minio/minio.service.js';
import { NullableType } from '../utils/types/nullable.type.js';

@Injectable()
export class FilesService {
  private readonly storage: FileDriver;
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly minioService: MinioService,
    private readonly i18n: I18nService,
    private dataSource: DataSource,
  ) {
    this.storage = this.configService.getOrThrow('file.driver', {
      infer: true,
    });
  }

  async findAllPaginated(query: PaginateQuery): Promise<Paginated<FileEntity>> {
    return await paginate<FileEntity>(
      query,
      this.fileRepository,
      filePaginationConfig,
    );
  }

  async findOne(
    fields: FindOptionsWhere<FileEntity>,
  ): Promise<NullableType<FileEntity>> {
    return await this.fileRepository.findOne({
      where: fields,
    });
  }

  async findOneOrFail(
    fields: FindOptionsWhere<FileEntity>,
  ): Promise<FileEntity> {
    return await this.fileRepository.findOneOrFail({
      where: fields,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<FileEntity> {
    console.log('=== SERVICE: uploadFile ===');
    console.log('File received in service:', file ? {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      filename: file.filename,
      path: file.path,
      location: (file as any).location,
    } : 'NO FILE');
    console.log('==========================');
    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          errors: {
            file: this.i18n.t('file.failedUpload', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const path = {
      local: `${this.configService.get('app.backendDomain', { infer: true })}/${this.configService.get('app.apiPrefix', { infer: true })}/v1/files/${
        file.filename
      }`,
      minio: (file as any).location,
    };
    return this.fileRepository.save(
      this.fileRepository.create({
        mimeType: file.mimetype,
        path: path[
          this.configService.getOrThrow('file.driver', { infer: true })
        ],
      }),
    );
  }

  async uploadMultipleFiles(
    files: Array<Express.Multer.File | any>,
  ): Promise<FileEntity[]> {
    if (!files) {
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          errors: {
            file: this.i18n.t('file.failedUpload', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    return await this.handleMultipleFilesUpload(files);
  }

  /**
   * Update file in storage and database
   * @returns {Promise<FileEntity>} success update of the file
   * @param id
   * @param file
   */
  async updateFile(
    id: string,
    file: Express.Multer.File,
  ): Promise<FileEntity> {
    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          errors: {
            file: this.i18n.t('file.failedUpload', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    // Delete old file
    const fileToUpdate = await this.findOneOrFail({ id });
    const fileKey = this.extractKeyFromUrl(fileToUpdate.path);
    await this.handleDelete(this.storage, fileKey);

    // Create new path for updated file
    const path = {
      local: `${this.configService.get('app.backendDomain', { infer: true })}/${this.configService.get('app.apiPrefix', { infer: true })}/v1/files/${
        file.filename
      }`,
      minio: (file as any).location,
    };

    const updatedFile = Object.assign({}, fileToUpdate, {
      mimeType: file.mimetype,
      path: path[this.storage],
    });
    return this.fileRepository.save(updatedFile);
  }

  async deleteMultipleFiles(files: FilesDto[]) {
    for (const file of files) {
      await this.deleteFile(file.id);
    }
  }

  /**
   * Delete file from storage and database
   * @returns {Promise<DeleteResult>} success deletion of the file
   * @param id
   */
  async deleteFile(id: string): Promise<DeleteResult> {
    const fileToDelete = await this.findOneOrFail({ id });
    const fileKey = this.extractKeyFromUrl(fileToDelete.path);

    // Call the appropriate delete handler
    await this.handleDelete(this.storage, fileKey);

    // Delete the record from the database
    return this.fileRepository.delete(fileToDelete.id);
  }

  private async handleDelete(
    storage: FileDriver,
    fileKey: string,
  ): Promise<void> {
    const deleteHandlers: Record<FileDriver, () => Promise<boolean>> = {
      [FileDriver.LOCAL]: async () => await this.deleteFileFromLocal(fileKey),
      [FileDriver.MINIO]: async () => await this.minioService.deleteFromBucket(fileKey),
    };

    const handler = deleteHandlers[storage];

    if (!handler) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          errors: {
            file: `Unsupported storage driver: ${storage}`,
          },
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    await handler();
  }

  /**
   * Extract the file key using its url
   * @returns {string} file key
   * @param url
   */
  extractKeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1] as string;
  }

  /**
   * Delete file from local uploads storage
   * @returns {Promise<boolean>} success deletion of the file
   * @param {string} key local file key
   */
  async deleteFileFromLocal(key: string): Promise<boolean> {
    const filePath = path.join(process.cwd(), 'uploads', key);

    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(
            new HttpException(
              {
                status: HttpStatus.EXPECTATION_FAILED,
                errors: {
                  file: this.i18n.t('file.failedDelete', {
                    lang: I18nContext.current()?.lang,
                  }),
                },
              },
              HttpStatus.EXPECTATION_FAILED,
            ),
          );
        } else {
          resolve(true); // Resolve with true when file deletion succeeds
        }
      });
    });
  }

  async createFileFromUrl(url: string): Promise<FileEntity> {
    const existingFile = await this.findOne({ path: url });
    if (!!existingFile) {
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          errors: {
            file: this.i18n.t('file.fileExists', {
              lang: I18nContext.current()?.lang,
            }),
          },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const file = this.fileRepository.create({ path: url });
    return await this.fileRepository.save(file);
  }

  async getPresignedUrl(type: string): Promise<PresignedUrlResponseDto> {
    return await this.minioService.generatePresignedUrl(type);
  }

  private async handleMultipleFilesUpload(
    files: Array<Express.Multer.File | any>,
  ): Promise<FileEntity[]> {
    return await this.dataSource.transaction(async (manager) => {
      return await Promise.all(
        files.map(async (file) => {
          const path = {
            local: `${this.configService.get('app.backendDomain', { infer: true })}/${this.configService.get('app.apiPrefix', { infer: true })}/v1/files/${
              file.filename
            }`,
            minio: (file as any).location,
          };
          return await manager.save(
            this.fileRepository.create({
              mimeType: file.mimetype,
              path: path[
                this.configService.getOrThrow('file.driver', { infer: true })
              ],
            }),
          );
        }),
      );
    });
  }
}
