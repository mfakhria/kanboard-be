import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';
import { ensureUploadsRootPath } from './common/utils/upload-path.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const uploadsPath = ensureUploadsRootPath();

  // Global prefix
  app.setGlobalPrefix('api');
  app.use('/uploads', express.static(uploadsPath));

  // CORS — supports comma-separated origins (e.g. "http://localhost:3000,https://kanboard.vercel.app")
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.split(',').map(o => o.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}/api`);
}

bootstrap();
