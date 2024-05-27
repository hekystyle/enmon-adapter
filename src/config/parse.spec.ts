import { faker } from '@faker-js/faker';
import { expect, it } from 'vitest';
import { ZodError } from 'zod';
import type { Config, InputConfig } from './schemas.js';
import { EnmonEnv } from '../enmon/ApiClient.js';
import { parseConfig } from './parse.js';
import { getError } from '../../tests/utils/getError.js';

const VALID_CONFIG_INPUT = {
  thermometers: [
    {
      model: 'UNI1xxx',
      dataSourceUrl: 'http://10.0.0.0',
      enmon: {
        customerId: faker.database.mongodbObjectId(),
        devEUI: 'devEUI',
        env: EnmonEnv.Dev,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      },
    },
    {
      model: 'UNI7xxx',
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
  ...VALID_CONFIG_INPUT,
  wattrouter: {
    baseURL: VALID_CONFIG_INPUT.wattrouter.baseURL,
    targets: [VALID_CONFIG_INPUT.wattrouter.enmon],
  },
} satisfies Config;

it.each([[VALID_CONFIG_INPUT, VALID_CONFIG_OUTPUT]])('should validate example config', async (input, output) => {
  const promise = parseConfig(input);

  await expect(promise).resolves.toStrictEqual(output);
});

it.each([
  [{}],
  [
    {
      thermometer: {},
      thermometers: [{}],
      wattrouter: {},
    },
  ],
  [
    {
      thermometer: { dataSourceUrl: 'invalid URL', enmon: {} },
      thermometers: [{ model: 'invalid model', dataSourceUrl: 'invalid URL', enmon: {} }],
      wattrouter: { baseURL: 'invalid URL', enmon: {} },
    },
  ],
  [
    {
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
