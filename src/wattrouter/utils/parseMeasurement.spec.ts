import { readFile } from 'fs/promises';
import path from 'path';
import { expect, it } from 'vitest';
import { parseMeasurement } from './parseMeasurement.js';
import type { Measurement } from '../schemas.js';

it('should parse valid XML example', async () => {
  const xml = await readFile(path.join(__dirname, '__tests__', 'meas.xml'), 'utf8');

  const actual = await parseMeasurement(xml);

  expect(actual).toEqual(
    expect.objectContaining<Measurement>({
      VAC: 237,
    }),
  );
});
