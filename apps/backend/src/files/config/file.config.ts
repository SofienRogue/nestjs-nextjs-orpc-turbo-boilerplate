import { registerAs } from '@nestjs/config';
import { FileConfig } from './file-config.type.js';
import { IsBoolean, IsEnum, IsNumber, IsString, ValidateIf } from 'class-validator';
import { FileDriver } from '../file-driver.enum.js';
import validateConfig from '../../utils/validate-config.js';

class EnvironmentVariablesValidator {
  @IsEnum(FileDriver)
  FILE_DRIVER: FileDriver;

  @ValidateIf((envValues) => envValues.FILE_DRIVER === FileDriver.MINIO)
  @IsString()
  MINIO_ACCESS_KEY_ID: string;

  @ValidateIf((envValues) => envValues.FILE_DRIVER === FileDriver.MINIO)
  @IsString()
  MINIO_SECRET_ACCESS_KEY: string;

  @ValidateIf((envValues) => envValues.FILE_DRIVER === FileDriver.MINIO)
  @IsBoolean()
  MINIO_USE_SSL: boolean;

  @ValidateIf((envValues) => envValues.FILE_DRIVER === FileDriver.MINIO)
  @IsString()
  MINIO_ENDPOINT: string;

  @ValidateIf((envValues) => envValues.FILE_DRIVER === FileDriver.MINIO)
  @IsNumber()
  MINIO_PORT: number;

  @ValidateIf((envValues) => envValues.FILE_DRIVER === FileDriver.MINIO)
  @IsString()
  MINIO_DEFAULT_BUCKET: string;
}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    driver: process.env.FILE_DRIVER ?? 'local',
    accessKeyId: process.env.MINIO_ACCESS_KEY_ID,
    secretAccessKey: process.env.MINIO_SECRET_ACCESS_KEY,
    minioUseSSL: false,
    minioEndpoint: process.env.MINIO_ENDPOINT,
    minioPort: Number(process.env.MINIO_PORT),
    minioDefaultBucket: process.env.MINIO_DEFAULT_BUCKET,
    maxFileSize: 5242880,
  };
});
