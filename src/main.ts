import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger as NativeLogger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.init();
  NativeLogger.log('Application initialized', bootstrap.name);
}

// eslint-disable-next-line no-console
bootstrap().catch(reason => console.error(reason));
