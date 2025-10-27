import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type.js';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async sendEmail({
    to,
    templatePath,
    subject,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    to: string;
    templatePath?: string;
    subject?: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    try {
      let html: string | Buffer | undefined;
      if (templatePath) {
        const template = await fs.readFile(templatePath, 'utf-8');
        html = Handlebars.compile(template, { strict: true })(context || {});
      }
      const sendingExportEmailOptions: ISendMailOptions = {
        from: mailOptions.from
          ? mailOptions.from
          : `"${this.configService.get('mail.defaultName', {
              infer: true,
            })}" <${this.configService.get('mail.defaultEmail', {
              infer: true,
            })}>`,
        to,
        subject,
        html: html,
        //context,
      };
      await this.mailerService.sendMail(sendingExportEmailOptions);
    } catch (error: any) {
      this.logger.error('Failed to send email', error.stack);
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          errors: {
            email: `email sending failed" ${error}`,
          },
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async sendDummyMail() {
    const result = await this.mailerService.sendMail({
      from: 'help@weavers.com',
      to: 'torbo@gmail.com',
      subject: 'WELCOME',
      text: 'Welcome to this world',
    });
    this.logger.log('Success send email', result);
  }
}
