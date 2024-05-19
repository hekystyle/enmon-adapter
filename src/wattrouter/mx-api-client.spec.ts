import { expect, it } from 'vitest';
import { WATTrouterMxApiClient } from './mx-api-client.js';

it('should create an instance', () => {
  expect(new WATTrouterMxApiClient('http://localhost:8080')).toBeInstanceOf(WATTrouterMxApiClient);
});
