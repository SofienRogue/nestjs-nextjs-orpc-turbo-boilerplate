import { z } from 'zod';

/**
 * Schema for send dummy mail response
 */
export const SendDummyMailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SendDummyMailOutput = z.infer<typeof SendDummyMailOutputSchema>;
