import { Module, Global } from '@nestjs/common';
import { MinioProvider } from './minio.provider.js';
import { MinioService } from './minio.service.js';

@Global()
@Module({
  providers: [MinioProvider, MinioService],
  exports: [MinioService],
})
export class MinioModule {}
