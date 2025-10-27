import { AppConfig } from './app-config.type.js';
import { DatabaseConfig } from '../database/config/database-config.type.js';
import { FileConfig } from '../files/config/file-config.type.js';
import { MailConfig } from '../mail/config/mail-config.type.js';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  file: FileConfig;
  mail: MailConfig;
};