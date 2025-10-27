import { TodoSchema } from "@workspace/orpc";
import { createZodDto } from "nestjs-zod";

export class TodoDto extends createZodDto(TodoSchema) {}