import { oc } from '@orpc/contract';
import { SendDummyMailOutputSchema } from '../schemas/mail.schema.js';

/**
 * Mail API contracts with OpenAPI routes
 * Each contract defines HTTP method, path, input validation, and output type
 */
export const mailContract = {
  /**
   * Send a dummy/test email
   * POST /v1/mail/send/dummy
   */
  sendDummy: oc
    .route({
      method: 'POST',
      path: '/v1/mail/send/dummy',
      summary: 'Send dummy email',
      description: 'Send a test email for development and testing purposes',
      tags: ['Mail'],
    })
    .output(SendDummyMailOutputSchema),
};
