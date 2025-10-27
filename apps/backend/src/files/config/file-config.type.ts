export type FileConfig = {
  driver: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  minioUseSSL: boolean;
  minioEndpoint?: string;
  minioPort?: number;
  minioDefaultBucket?: string;
  maxFileSize: number;
};
