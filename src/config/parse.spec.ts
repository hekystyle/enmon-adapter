import { ObjectId } from 'bson';
import { Config } from './types.js';
import { EnmonEnv } from '../services/enmon.js';
import { parseConfig } from './parse.js';

const VALID_CONFIG: Config = {
  thermometer: {
    dataSourceUrl: 'http://10.0.0.0',
    enmon: {
      customerId: new ObjectId().toHexString(),
      devEUI: 'devEUI',
      env: EnmonEnv.Dev,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    },
  },
  wattrouter: {
    baseURL: 'http://10.0.0.0',
    enmon: {
      customerId: new ObjectId().toHexString(),
      devEUI: 'devEUI',
      env: EnmonEnv.Dev,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    },
  },
};

it.each([[VALID_CONFIG]])('should validate example config', async configObj => {
  const promise = parseConfig(configObj);

  await expect(promise).resolves.toBeInstanceOf(Config);
});

it.each([
  [{}],
  [
    {
      thermometer: {},
      wattrouter: {},
    },
  ],
  [
    {
      thermometer: { dataSourceUrl: 'invalid URL', enmon: {} },
      wattrouter: { baseURL: 'invalid URL', enmon: {} },
    },
  ],
  [
    {
      thermometer: {
        dataSourceUrl: 'invalid URL',
        enmon: { customerId: 'invalid ID', devEUI: '', env: 'invalid EnmonEnv', token: '' },
      },
      wattrouter: {
        baseURL: 'invalid URL',
        enmon: { customerId: 'invalid ID', devEUI: '', env: 'invalid EnmonEnv', token: '' },
      },
    },
  ],
])('should reject invalid config %#', async configObj => {
  const promise = parseConfig(configObj);
  await expect(promise).rejects.toBeInstanceOf(Array);
  await expect(promise).rejects.toMatchSnapshot();
});
