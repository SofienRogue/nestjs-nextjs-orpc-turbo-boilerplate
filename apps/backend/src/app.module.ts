import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service.js';
import { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './database/config/database.config.js';
import fileConfig from './files/config/file.config.js';
import appConfig from './config/app.config.js';
import mailConfig from './mail/config/mail.config.js';
import { ORPCModule } from '@orpc/nest';
import { TodosModule } from './todos/todos.module.js';
import { FilesModule } from './files/files.module.js';
import { MailModule } from './mail/mail.module.js';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter.js';
import { MinioModule } from './utils/minio/minio.module.js';
import { MulterConfigModule } from './shared/multer-config.module.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { AllConfigType } from './config/config.type.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        fileConfig,
        appConfig,
        mailConfig
      ],
      envFilePath: ['.env.local'],
    }),
    TypeOrmModule.forRootAsync({
       useClass: TypeOrmConfigService,
       dataSourceFactory: async (options?: DataSourceOptions) => {
         if (!options) {
           throw new Error('DataSource options are required');
         }
         return new DataSource(options).initialize();
       },
    }),
    ORPCModule.forRootAsync({
      useFactory: () => ({
        context: (req: any, res: any) => ({
          request: req,
          response: res,
        }),
      }),
    }),
    AuthModule.forRoot({ auth }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    MinioModule,
    MulterConfigModule,
    TodosModule,
    FilesModule,
    MailModule
  ],
  controllers: [],
  providers: [
        {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
  ],
})
export class AppModule {}
