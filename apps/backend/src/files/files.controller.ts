import {
  Controller,
  UseInterceptors,
  Req,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileUpload } from '../utils/open-api/file-upload.decorator.js';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { contract } from '@workspace/orpc';
import { FilesService } from './files.service.js';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PaginateQuery } from 'nestjs-paginate';
import { FilesDto } from './dto/files.dto.js';
import { ZodResponse } from 'nestjs-zod';

@Controller()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  /**
   * Upload a single file
   * POST /files/upload
   */
  @FileUpload('file')
  @ZodResponse({ type: FilesDto })
  @Implement(contract.file.upload)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): any {
    return implement(contract.file.upload).handler(async () => {
      console.log('=== CONTROLLER: uploadFile with Success ===');
      console.log('File object:', file);
      console.log('File keys:', file ? Object.keys(file) : 'NO FILE');
      console.log('File details:', file ? JSON.stringify(file, null, 2) : 'NO FILE');
      console.log('=============================');  
      return await this.filesService.uploadFile(file);
    });
  }

  /**
   * Upload multiple files
   * POST /files/upload-multiple
   */
  @FileUpload('files', { isArray: true, maxItems: 10 })
  @Implement(contract.file.uploadMultiple)
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>): any {
    return implement(contract.file.uploadMultiple).handler(
      async () => {
        return await this.filesService.uploadMultipleFiles(files);
      }
    );
  }

  /**
   * Get presigned URL for file upload
   * GET /files/presigned/{type}
   */
  @Implement(contract.file.getPresignedUrl)
  getPresignedUrl(): any {
    return implement(contract.file.getPresignedUrl).handler(
      async ({ input }) => {
        return this.filesService.getPresignedUrl(input.type);
      }
    );
  }

  /**
   * List all files with pagination
   * GET /files
   */
  @Implement(contract.file.list)
  listFiles(): any {
    return implement(contract.file.list).handler(async ({ input }) => {
      const query = input as unknown as PaginateQuery;
      const result = await this.filesService.findAllPaginated(query);
      
      // Transform nestjs-paginate result to match ORPC contract
      return {
        data: result.data,
        meta: {
          totalItems: result.meta.totalItems ?? 0,
          itemCount: result.data.length,
          itemsPerPage: result.meta.itemsPerPage,
          totalPages: result.meta.totalPages ?? 0,
          currentPage: result.meta.currentPage ?? 1,
        },
        links: result.links,
      };
    });
  }
  /**
   * Get a single file by ID
   * GET /files/{id}
   */
  @Implement(contract.file.get)
  getFile(): any {
    return implement(contract.file.get).handler(async ({ input }) => {
      const result = await this.filesService.findOne({ id: input.id });
      if (!result) return null;
      return result;
    });
  }

  /**
   * Update a file in storage and database
   * PUT /files/{id}
   */
  @FileUpload('file')
  @Implement(contract.file.update)
  @UseInterceptors(FileInterceptor('file'))
  updateFile(@UploadedFile() file: Express.Multer.File): any {
    return implement(contract.file.update).handler(async ({ input }) => {
      const result = await this.filesService.updateFile(input.id, file);
      return result;
    });
  }

  /**
   * Delete a file in storage and database
   * DELETE /files/{id}
   */
  @Implement(contract.file.delete)
  deleteFile(): any {
    return implement(contract.file.delete).handler(async ({ input }) => {
      const result = await this.filesService.deleteFile(input.id);
      return {
        affected: result.affected ?? undefined,
        raw: result.raw,
      };
    });
  }
}
