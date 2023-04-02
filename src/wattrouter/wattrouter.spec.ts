import { WATTrouterMxApiClient } from './wattrouter.js';

it('should create an instance', () => {
  expect(new WATTrouterMxApiClient('http://localhost:8080')).toBeInstanceOf(WATTrouterMxApiClient);
});
