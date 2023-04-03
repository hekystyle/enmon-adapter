import { Provider } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { parseConfig } from '../src/config/parse.js';
import { Config } from '../src/config/types.js';
import { EnmonEnv } from '../src/enmon/ApiClient.js';

export const testConfigProvider: Provider = {
  provide: Config,
  useFactory: () =>
    parseConfig({
      thermometer: {
        dataSourceUrl: faker.internet.url(),
        enmon: {
          env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
          customerId: faker.database.mongodbObjectId(),
          devEUI: faker.random.alphaNumeric(8),
          token: faker.random.alphaNumeric(64),
        },
      },
      thermometers: [
        {
          model: 'UNI7xxx',
          dataSourceUrl: faker.internet.url(),
          enmon: {
            env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
            customerId: faker.database.mongodbObjectId(),
            devEUI: faker.random.alphaNumeric(8),
            token: faker.random.alphaNumeric(64),
          },
        },
      ],
      wattrouter: {
        baseURL: faker.internet.url(),
        enmon: {
          env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
          customerId: faker.database.mongodbObjectId(),
          devEUI: faker.random.alphaNumeric(8),
          token: faker.random.alphaNumeric(64),
        },
      },
    } satisfies Config),
};
