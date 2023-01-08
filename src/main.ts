import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from './logger.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(Logger));
  await app.init();
}

// eslint-disable-next-line no-console
bootstrap().catch(reason => console.error(reason));
