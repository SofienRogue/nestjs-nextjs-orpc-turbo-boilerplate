import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller.js';
import { TodosService } from './todos.service.js';
import { MulterConfigModule } from '../shared/multer-config.module.js';

@Module({
  imports: [MulterConfigModule],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}