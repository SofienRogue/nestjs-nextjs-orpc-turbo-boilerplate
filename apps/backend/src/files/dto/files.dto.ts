import { createZodDto } from "nestjs-zod";
import { FileSchema, PresignedUrlRequestSchema, PresignedUrlResponseSchema } from "@workspace/orpc";

export class FilesDto extends createZodDto(FileSchema) {}
export class PresignedUrlResponseDto extends createZodDto(PresignedUrlResponseSchema) {}
export class PresignedUrlRequestSchemaDto extends createZodDto(PresignedUrlRequestSchema) {}