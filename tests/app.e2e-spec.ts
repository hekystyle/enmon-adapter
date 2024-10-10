import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule, CONFIG_MODULE } from '../src/app.module.js';
import configuration from './configuration.js';

let builder: TestingModuleBuilder;
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  builder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(CONFIG_MODULE)
    .useModule(
      ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration({ dbUri: mongod.getUri() })],
      }),
    );
});

it(`boot, init & stop successfully`, async () => {
  const app = await builder.compile();

  await expect(app.init()).resolves.toBeDefined();

  await expect(app.close()).resolves.toBeUndefined();
});

afterAll(async () => {
  await mongod.stop();
});
