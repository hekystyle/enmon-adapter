import { faker } from '@faker-js/faker';
import { expect, it } from 'vitest';
import { ZodError } from 'zod';
import { type Config, type InputConfig } from './schemas.js';
import { parseConfig } from './parse.js';
import { getError } from '../../tests/utils/getError.js';
import { WATTrouterModel } from '../wattrouter/model.js';
import { EnmonEnv } from '../enmon/env.enum.js';
import { ThermometerModel } from '../thermometers/model.enum.js';

const VALID_CONFIG_INPUT_V0_1 = {
  DEV: true,
  thermometers: [
    {
      model: ThermometerModel.UNI1xxx,
      dataSourceUrl: 'http://10.0.0.0',
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: 'devEUI',
        env: EnmonEnv.Dev,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      },
    },
    {
      model: ThermometerModel.UNI7xxx,
      dataSourceUrl: `http://10.0.0.0`,
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: faker.string.alphanumeric(16),
        env: EnmonEnv.Dev,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      },
    },
  ],
  wattrouter: {
    baseURL: 'http://10.0.0.0',
    enmon: {
      customerId: faker.database.mongodbObjectId(),
      devEUI: 'devEUI',
      env: EnmonEnv.Dev,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    },
  },
} satisfies InputConfig;

const VALID_CONFIG_OUTPUT_V0_1 = {
  DEV: VALID_CONFIG_INPUT_V0_1.DEV,
  db: { uri: 'mongodb://db/enmon-adapter' },
  enmon: {},
  thermometers: VALID_CONFIG_INPUT_V0_1.thermometers,
  wattrouters: [
    {
      model: WATTrouterModel.Mx,
      baseURL: VALID_CONFIG_INPUT_V0_1.wattrouter.baseURL,
      targets: [VALID_CONFIG_INPUT_V0_1.wattrouter.enmon],
    },
  ],
} satisfies Config;

const VALID_CONFIG_INPUT_V0_2 = {
  DEV: true,
  thermometers: [
    {
      model: ThermometerModel.UNI1xxx,
      dataSourceUrl: 'http://10.0.0.0',
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: 'devEUI',
        env: EnmonEnv.Dev,
        token: faker.internet.password(),
      },
    },
    {
      model: ThermometerModel.UNI7xxx,
      dataSourceUrl: `http://10.0.0.0`,
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: faker.string.alphanumeric(16),
        env: EnmonEnv.Dev,
        token: faker.internet.password(),
      },
    },
  ],
  wattrouter: {
    baseURL: 'http://10.0.0.0',
    enmon: {
      customerId: faker.database.mongodbObjectId(),
      devEUI: 'devEUI',
      env: EnmonEnv.Dev,
      token: faker.internet.password(),
    },
  },
} satisfies InputConfig;

const VALID_CONFIG_OUTPUT_V0_2 = {
  DEV: VALID_CONFIG_INPUT_V0_2.DEV,
  db: { uri: 'mongodb://db/enmon-adapter' },
  enmon: {},
  thermometers: VALID_CONFIG_INPUT_V0_2.thermometers,
  wattrouters: [
    {
      model: WATTrouterModel.Mx,
      baseURL: VALID_CONFIG_INPUT_V0_2.wattrouter.baseURL,
      targets: [VALID_CONFIG_INPUT_V0_2.wattrouter.enmon],
    },
  ],
} satisfies Config;

const VALID_CONFIG_INPUT_V1 = {
  DEV: true,
  db: {
    uri: faker.internet.url(),
  },
  enmon: {
    contactEmail: faker.internet.email(),
  },
  thermometers: [
    {
      model: ThermometerModel.UNI1xxx,
      dataSourceUrl: 'http://10.0.0.0',
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: 'devEUI',
        env: EnmonEnv.Dev,
        token: faker.internet.password(),
      },
    },
    {
      model: ThermometerModel.UNI7xxx,
      dataSourceUrl: `http://10.0.0.0`,
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: faker.string.alphanumeric(16),
        env: EnmonEnv.Dev,
        token: faker.internet.password(),
      },
    },
  ],
  wattrouters: [
    {
      model: WATTrouterModel.Mx,
      baseURL: 'http://10.0.0.0',
      targets: [
        {
          customerId: faker.database.mongodbObjectId(),
          devEUI: 'devEUI',
          env: EnmonEnv.Dev,
          token: faker.internet.password(),
        },
      ],
    },
  ],
} satisfies InputConfig;

const VALID_CONFIG_OUTPUT_V1 = {
  DEV: VALID_CONFIG_INPUT_V1.DEV,
  db: VALID_CONFIG_INPUT_V1.db,
  enmon: VALID_CONFIG_INPUT_V1.enmon,
  thermometers: VALID_CONFIG_INPUT_V1.thermometers,
  wattrouters: VALID_CONFIG_INPUT_V1.wattrouters,
} satisfies Config;

it.each([
  ['0.1', VALID_CONFIG_INPUT_V0_1, VALID_CONFIG_OUTPUT_V0_1],
  ['0.2', VALID_CONFIG_INPUT_V0_2, VALID_CONFIG_OUTPUT_V0_2],
  ['1', VALID_CONFIG_INPUT_V1, VALID_CONFIG_OUTPUT_V1],
])('should validate example v%s config', async (_version, input, output) => {
  const promise = parseConfig(input);

  await expect(promise).resolves.toStrictEqual(output);
});

it.each([
  [
    {
      thermometer: {},
      thermometers: [{}],
      wattrouter: {},
    },
  ],
  [
    {
      db: {},
      thermometer: { dataSourceUrl: 'invalid URL', enmon: {} },
      thermometers: [{ model: 'invalid model', dataSourceUrl: 'invalid URL', enmon: {} }],
      wattrouter: { baseURL: 'invalid URL', enmon: {} },
    },
  ],
  [
    {
      db: {
        uri: 'invalid URL',
      },
      enmon: {
        contactEmail: 'invalid email',
      },
      thermometer: {
        dataSourceUrl: 'invalid URL',
        enmon: { customerId: 'invalid ID', devEUI: '', env: 'invalid EnmonEnv', token: '' },
      },
      thermometers: [
        {
          model: 'invalid model',
          dataSourceUrl: 'invalid URL',
          enmon: { customerId: 'invalid ID', devEUI: '', env: 'invalid EnmonEnv', token: '' },
        },
      ],
      wattrouter: {
        baseURL: 'invalid URL',
        enmon: { customerId: 'invalid ID', devEUI: '', env: 'invalid EnmonEnv', token: '' },
      },
    },
  ],
])('should reject invalid config %#', async configObj => {
  const e = await getError(() => parseConfig(configObj));
  expect(e).toBeInstanceOf(ZodError);
  expect((e as ZodError).errors).toMatchSnapshot();
});
