import { expect, it } from 'vitest';
import { RegistersMapper } from './registers-mapper.js';

it('should remap registers correctly', () => {
  const map = new Map([
    ['1-1.8.2', '1-1.8.0'],
    ['1-1.8.3', '1-1.8.1'],
    ['20-1.0.0', ''],
  ]);

  const actual = RegistersMapper.remap(map, [
    {
      readAt: 'any date',
      register: '1-1.8.2',
      propA: 1,
    },
    {
      register: '1-1.8.3',
      propB: true,
    },
    {
      register: '1-2.8.0',
      propC: [],
    },
  ]);

  expect(actual).toStrictEqual({
    readings: [
      {
        readAt: 'any date',
        register: '1-1.8.0',
        propA: 1,
      },
      {
        register: '1-1.8.1',
        propB: true,
      },
      {
        register: '1-2.8.0',
        propC: [],
      },
    ],
    unusedMappings: ['20-1.0.0'],
  });
});
