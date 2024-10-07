import { Test } from '@nestjs/testing';
import { INestApplicationContext } from '@nestjs/common';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module.js';
import configuration from './configuration.js';

let app: INestApplicationContext;
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(ConfigModule)
    .useModule(
      ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration({ dbUri: mongod.getUri() })],
      }),
    )
    .compile();

  app = moduleRef;
});

it(`should start & stop successfully`, async () => {
  await expect(app.init()).resolves.toBeDefined();

  await expect(app.close()).resolves.toBeUndefined();
});

afterAll(async () => {
  await mongod.stop();
});
