import { Controller } from '@nestjs/common';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { contract } from '@workspace/orpc';
import { MailService } from './mail.service.js';
import { ZodResponse } from 'nestjs-zod';
import { MailDto } from './dto/mail.dto.js';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * Send a dummy/test email
   * POST /mail/send/dummy
   */
  @ZodResponse({ type: MailDto})
  @Implement(contract.mail.sendDummy)
  sendDummyMail(): any {
    return implement(contract.mail.sendDummy).handler(async () => {
      await this.mailService.sendDummyMail();
      return {
        success: true,
        message: 'Dummy email sent successfully',
      };
    });
  }
}
