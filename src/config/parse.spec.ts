import { faker } from '@faker-js/faker';
import { expect, it } from 'vitest';
import { ZodError } from 'zod';
import { type Config, type InputConfig } from './schemas.js';
import { parseConfig } from './parse.js';
import { getError } from '../../tests/utils/getError.js';
import { WATTrouterModel } from '../wattrouter/model.js';
import { EnmonEnv } from '../enmon/env.enum.js';
import { ThermometerModel } from '../thermometers/model.enum.js';

const VALID_CONFIG_INPUT = {
  DEV: true,
  db: {
    uri: 'mongodb://host/dbname',
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

const VALID_CONFIG_OUTPUT = {
  DEV: VALID_CONFIG_INPUT.DEV,
  db: VALID_CONFIG_INPUT.db,
  enmon: VALID_CONFIG_INPUT.enmon,
  thermometers: VALID_CONFIG_INPUT.thermometers,
  wattrouters: [
    {
      model: WATTrouterModel.Mx,
      baseURL: VALID_CONFIG_INPUT.wattrouter.baseURL,
      targets: [VALID_CONFIG_INPUT.wattrouter.enmon],
    },
  ],
} satisfies Config;

it.each([[VALID_CONFIG_INPUT, VALID_CONFIG_OUTPUT]])('should validate example config', async (input, output) => {
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
