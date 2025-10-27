export interface MailData<T = never> {
  to: string;
  data: T;
  subject?: string;
  text?: string;
}
