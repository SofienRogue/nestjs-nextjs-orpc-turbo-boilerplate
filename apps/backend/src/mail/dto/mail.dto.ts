import { SendDummyMailOutputSchema } from "@workspace/orpc";
import { createZodDto } from "nestjs-zod";

export class MailDto extends createZodDto(SendDummyMailOutputSchema) {}