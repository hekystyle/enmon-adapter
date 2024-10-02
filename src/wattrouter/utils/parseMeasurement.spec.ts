import { readFile } from 'fs/promises';
import path from 'path';
import { expect, it } from 'vitest';
import { parseMeasurement } from './parseMeasurement.js';
import { Measurement } from '../measurement.schema.js';

it('should parse valid XML example', async () => {
  const xml = await readFile(path.join(__dirname, '__fixtures__', 'meas.xml'), 'utf8');

  const actual = await parseMeasurement(xml);

  expect(actual).toStrictEqual<Measurement>({
    VAC: 237,
  });
});
