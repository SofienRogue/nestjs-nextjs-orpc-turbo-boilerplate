import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema for creating a todo with file
const CreateTodoWithFileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  completed: z.boolean().optional().default(false),
});

export class CreateTodoWithFileDto extends createZodDto(CreateTodoWithFileSchema) {}
