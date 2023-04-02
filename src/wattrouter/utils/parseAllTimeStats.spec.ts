import { parseAllTimeStats } from './parseAllTimeStats.js';
import { AllTimeStats } from '../types.js';

it.each([
  [{}],
  [{ stat_alltime: {} }],
  [
    {
      stat_alltime: {
        SAD: 'invalid date',
        SAS1: 'invalid number (SAS1)',
        SAH1: 'invalid number (SAH1)',
        SAL1: 'invalid number (SAL1)',
        SAP1: 'invalid number (SAP1)',
        SAS2: 'invalid number (SAS2)',
        SAH2: 'invalid number (SAH2)',
        SAL2: 'invalid number (SAL2)',
        SAP2: 'invalid number (SAP2)',
        SAS3: 'invalid number (SAS3)',
        SAH3: 'invalid number (SAH3)',
        SAL3: 'invalid number (SAL3)',
        SAP3: 'invalid number (SAP3)',
        SAS4: 'invalid number (SAS4)',
        SAH4: 'invalid number (SAH4)',
        SAL4: 'invalid number (SAL4)',
        SAP4: 'invalid number (SAP4)',
      },
    },
  ],
])('should reject invalid', async plain => {
  const promise = parseAllTimeStats(plain);
  await expect(promise).rejects.toBeInstanceOf(Array);
  await expect(promise).rejects.toMatchSnapshot();
});

it.each([
  [
    {
      stat_alltime: {
        SAD: '2022-08-28',
        SAH1: '1.01',
        SAH2: '2.02',
        SAH3: '3.03',
        SAH4: '4.04',
        SAL1: '5.05',
        SAL2: '6.06',
        SAL3: '7.07',
        SAL4: '8.08',
        SAP1: '9.09',
        SAP2: '10.10',
        SAP3: '11.11',
        SAP4: '12.12',
        SAS1: '13.13',
        SAS2: '14.14',
        SAS3: '15.15',
        SAS4: '16.16',
      },
    },
  ] as const,
])('should parse valid', async plain => {
  const promise = parseAllTimeStats(plain);
  await expect(promise).resolves.toBeInstanceOf(AllTimeStats);
  await expect(promise).resolves.toMatchSnapshot();
});
