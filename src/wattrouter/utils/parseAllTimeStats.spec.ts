import { expect, it } from 'vitest';
import { readFile } from 'fs/promises';
import path from 'node:path';
import { parseAllTimeStats } from './parseAllTimeStats.js';
import { AllTimeStats } from '../all-time-stats.schema.js';

it('should parse valid', async () => {
  const xml = await readFile(path.join(__dirname, '__fixtures__', 'stat_alltime.xml'), 'utf8');

  const actual = await parseAllTimeStats(xml);

  expect(actual).toStrictEqual<AllTimeStats>({
    SAS4: 1476.53,
    SAH4: 5276.82,
    SAL4: 11574.53,
    SAP4: 22330.82,
  });
});
