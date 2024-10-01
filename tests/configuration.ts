import { faker } from '@faker-js/faker';
import { EnmonEnv } from '../src/enmon/ApiClient.js';
import { Config, ThermometerModel } from '../src/config/schemas.js';
import { WATTrouterModel } from '../src/wattrouter/model.js';

export default (): Config =>
  ({
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
