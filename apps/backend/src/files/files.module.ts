import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller.js';
import { FileEntity } from './entities/file.entity.js';
import { FilesService } from './files.service.js';
import { MulterConfigModule } from '../shared/multer-config.module.js';

@Global()
@Module({
  imports: [
    MulterConfigModule,
    TypeOrmModule.forFeature([FileEntity])
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
