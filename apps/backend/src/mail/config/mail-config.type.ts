export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  service?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
};
