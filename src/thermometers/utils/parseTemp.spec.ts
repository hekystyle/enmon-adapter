import { readFile } from 'fs/promises';
import { expect, it } from 'vitest';
import { parseTemperature } from './parseTemp.js';

it('should parse temperature value from example HTML file', async () => {
  const html = await readFile('./tests/data/temp.html', 'utf8');
  const temperature = parseTemperature(html);
  expect(temperature).toBe('60.81');
});
