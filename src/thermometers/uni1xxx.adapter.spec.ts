import { readFile } from 'fs/promises';
import { expect, it } from 'vitest';
import path from 'path';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';

it('should parse temperature value from example HTML file', async () => {
  const html = await readFile(path.join(import.meta.dirname, '__fixtures__', 'temp-uni1xxx.html'), 'utf8');
  const temperature = new ThermometerUNI1xxx().parseTemperature(html);
  expect(temperature).toBe(60.81);
});
