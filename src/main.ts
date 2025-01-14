import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger as NativeLogger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.init();
  NativeLogger.log('Application initialized', bootstrap.name);

  const port = process.env['APP_HTTP_PORT'] ?? 80;
  const hostname = '0.0.0.0';
  await app.listen(port, hostname, () => NativeLogger.log(`Listening on ${hostname}:${port}`, bootstrap.name));
}

// eslint-disable-next-line no-console
bootstrap().catch(reason => console.error(reason));
