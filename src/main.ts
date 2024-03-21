import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ContextAwareLogger } from './log/context-aware.logger.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = await app.resolve(ContextAwareLogger);
  app.useLogger(logger.setContext('App'));
  await app.init();
  logger.log('Application initialized');
}

// eslint-disable-next-line no-console
bootstrap().catch(reason => console.error(reason));
