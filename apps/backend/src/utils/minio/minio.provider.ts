import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio'

export const MinioProvider: Provider = {
  provide: 'MINIO_CLIENT',
  useFactory: (configService: ConfigService) => {
    const endPoint = configService.getOrThrow<string>('file.minioEndpoint', {
      infer: true,
    });
    const port = configService.getOrThrow<number>('file.minioPort', {
      infer: true,
    });
    const useSSL = configService.getOrThrow<boolean>('file.minioUseSSL', {
      infer: true,
    });
    const accessKeyId = configService.getOrThrow<string>('file.accessKeyId', {
      infer: true,
    });
    const secretAccessKey = configService.getOrThrow<string>(
      'file.secretAccessKey',
      {
        infer: true,
      },
    );
    const bucket = configService.getOrThrow<string>('file.minioDefaultBucket', {
      infer: true,
    });

    return {
      client: new Minio.Client({
        endPoint,
        port,
        useSSL: false,
        accessKey: accessKeyId,
        secretKey: secretAccessKey,
      }),
      bucket,
      endPoint,
      port,
      useSSL,
    };
  },
  inject: [ConfigService],
};
