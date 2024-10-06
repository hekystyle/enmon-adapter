import { faker } from '@faker-js/faker';
import { Config } from '../src/config/schemas.js';
import { WATTrouterModel } from '../src/wattrouter/model.js';
import { ThermometerModel } from '../src/thermometers/model.enum.js';
import { EnmonEnv } from '../src/enmon/env.enum.js';

export default (): Config =>
  ({
    DEV: true,
    db: {
      uri: 'mongodb://db/dbname',
    },
    enmon: {
      contactEmail: 'test@test.tst',
    },
    thermometers: [
      {
        model: ThermometerModel.UNI7xxx,
        dataSourceUrl: faker.internet.url(),
        enmon: {
          env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
          customerId: faker.database.mongodbObjectId(),
          devEUI: faker.string.alphanumeric(8),
          token: faker.string.alphanumeric(64),
        },
      },
    ],
    wattrouters: [
      {
        model: WATTrouterModel.Mx,
        baseURL: faker.internet.url(),
        targets: [
          {
            env: faker.helpers.arrayElement(Object.values(EnmonEnv)),
            customerId: faker.database.mongodbObjectId(),
            devEUI: faker.string.alphanumeric(8),
            token: faker.string.alphanumeric(64),
          },
        ],
      },
    ],
  }) satisfies Config;
