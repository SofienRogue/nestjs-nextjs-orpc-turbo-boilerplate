import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { contract } from '@workspace/orpc';
import { TodosService } from './todos.service.js';
import { ZodResponse } from 'nestjs-zod';
import { TodoDto } from './dto/todo.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTodoWithFileDto } from './dto/create-todo-with-file.dto.js';
import { ParseFormdataPipe } from '../utils/pipes/parse-formdata.pipe.js';
import { FileUpload } from '../utils/open-api/file-upload.decorator.js';

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * List all todos
   * GET /todos
   */
  @Implement(contract.todo.list)
  listTodos(): any {
    return implement(contract.todo.list).handler(async () => {
      return this.todosService.findAll();
    });
  }

  /**
   * Get a single todo by ID
   * GET /todos/{id}
   */
  @ZodResponse({ type: TodoDto })
  @Implement(contract.todo.get)
  getTodo(): any {
    return implement(contract.todo.get).handler(async ({ input }) => {
      return this.todosService.findOne(input.id);
    });
  }

  /**
   * Create a new todo
   * POST /todos
   */
  @Implement(contract.todo.create)
  createTodo(): any {
    return implement(contract.todo.create).handler(async ({ input }) => {
      console.log('todo', input);
      return this.todosService.create(input);
    });
  }

  /**
   * Create a new todo with file upload
   * POST /todos/with-file
   */
  @FileUpload('file', {
    additionalFields: [
      {
        name: 'data',
        type: 'object',
        schema: CreateTodoWithFileDto,
        required: true,
        description: 'Todo data as JSON string',
      },
    ],
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @Implement(contract.todo.createWithFile)
  createTodoWithFile(
    @UploadedFile() file?: Express.Multer.File,
  ): any {
    return implement(contract.todo.createWithFile).handler(async ({ input }) => {
      console.log('=== CREATE TODO WITH FILE ===');
      console.log('Data:', input.data);
      console.log('File:', file ? file : 'No file uploaded');
      console.log('=============================');
      
      // Create the todo with the data (already parsed by ORPC)
      const todo = await this.todosService.create(input.data);
      
      // Return the created todo with file info
      return {
        ...todo,
        file: file ? {
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        } : null,
      };
    });
  }

  /**
   * Update an existing todo
   * PUT /todos/{id}
   */
  @Implement(contract.todo.update)
  updateTodo(): any {
    return implement(contract.todo.update).handler(async ({ input }) => {
      const { id, ...updates } = input;
      return this.todosService.update(id, updates);
    });
  }

  /**
   * Delete a todo by ID
   * DELETE /todos/{id}
   */
  @Implement(contract.todo.delete)
  deleteTodo(): any {
    return implement(contract.todo.delete).handler(async ({ input }) => {
      return this.todosService.delete(input.id);
    });
  }
}