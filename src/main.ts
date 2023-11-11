import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppLogger } from './logger.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  const logger = await app.resolve(AppLogger);
  app.useLogger(logger);

  await app.init();
}

// eslint-disable-next-line no-console
bootstrap().catch(reason => console.error(reason));
