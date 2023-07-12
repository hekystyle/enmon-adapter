import { type Provider } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { parseConfig, type Config, configProvider } from '../src/config/index.js';
import { EnmonEnv } from '../src/enmon/ApiClient.js';

export const testConfigProvider: Provider<Config> = {
  provide: configProvider.provide,
  useFactory: () =>
    parseConfig({
      thermometers: [
        {
          model: 'UNI7xxx',
          dataSourceUrl: faker.internet.url(),
          enmon: {
            env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
            customerId: faker.database.mongodbObjectId(),
            devEUI: faker.string.alphanumeric(8),
            token: faker.string.alphanumeric(64),
          },
        },
      ],
      wattrouter: {
        baseURL: faker.internet.url(),
        enmon: {
          env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
          customerId: faker.database.mongodbObjectId(),
          devEUI: faker.string.alphanumeric(8),
          token: faker.string.alphanumeric(64),
        },
      },
    } satisfies Config),
};
