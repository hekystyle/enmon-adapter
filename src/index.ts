import 'reflect-metadata';
import 'dotenv/config';
import debug, { Debugger } from 'debug';
import { CronJob } from 'cron';
import axios from 'axios';
import { Decimal } from 'decimal.js';
import config from './config/index.js';
import { parseTemperature } from './parseTemp.js';
import { EnmonApiClient } from './services/enmon.js';
import { WATTrouterMxApiClient } from './services/wattrouter.js';

const log = debug('app');

process.on('unhandledRejection', reason => {
  log({ msg: 'unhandled rejection', reason });
});

process.on('uncaughtException', error => {
  log({ msg: 'uncaught exception', error });
  process.exit(1);
});

async function fetchTemperature(): Promise<undefined | number> {
  const {
    status,
    statusText,
    data: html,
  } = await axios.get<string>(config.thermometer.dataSourceUrl, {
    validateStatus: () => true,
  });

  log({
    msg: 'fetch temperature meter HTML page',
    status,
    statusText,
    html: status !== 200 ? html : '<hidden>',
  });

  if (status !== 200) return undefined;

  const serializedValue = parseTemperature(html);

  log({
    msg: 'founded serialized temperature value',
    serialized: serializedValue,
  });

  if (!serializedValue) return undefined;
  const temperature = parseFloat(serializedValue);

  log({
    msg: 'parsed temperature value',
    parsed: temperature,
  });

  return Number.isNaN(temperature) ? undefined : temperature;
}

async function uploadTemperature(temperature: number): Promise<void> {
  const { env, customerId, devEUI, token } = config.thermometer.enmon;

  const client = new EnmonApiClient(env);

  const { status, statusText, data } = await client.postMeterPlainValue({
    customerId,
    token,
    payload: {
      devEUI,
      date: new Date(),
      value: temperature,
    },
  });

  log({ msg: 'upload temperature result', status, statusText, data });
}

async function handleTemperature() {
  const temperature = await fetchTemperature();

  if (temperature) await uploadTemperature(temperature);
}

async function getAllTimeStats(client: WATTrouterMxApiClient) {
  try {
    return await client.getAllTimeStats();
  } catch (e) {
    if (axios.isAxiosError<unknown>(e)) {
      const { statusText, status } = e.response ?? {};
      log({
        msg: 'failed to fetch wattrouter alltime stats',
        status,
        statusText,
        data: e.response?.data,
      });
    } else {
      throw e;
    }
    return undefined;
  }
}

async function handleWattrouter() {
  const wattrouterApiClient = new WATTrouterMxApiClient(config.wattrouter.baseURL);
  const allTimeStats = await getAllTimeStats(wattrouterApiClient);
  if (!allTimeStats) return;
  const measurements = await wattrouterApiClient.getMeasurement();
  const { SAH4, SAL4, SAP4, SAS4 } = allTimeStats;
  log({
    msg: 'fetched wattrouter stats',
    consumptionHT: SAH4,
    consumptionLT: SAL4,
    production: SAP4,
    surplus: SAS4,
    voltageL1: measurements.VAC,
  });

  const { customerId, token, devEUI } = config.wattrouter.enmon;

  const legacyCounters = [
    [`consumption-ht`, SAH4],
    [`consumption-lt`, SAL4],
    [`production`, SAP4],
    [`surplus`, SAS4],
  ] as const;

  const registersCounters = [
    [`1-1.8.0`, Decimal.sub(SAP4, SAS4).toNumber()], // consumption of own production
    [`1-1.8.2`, SAH4],
    [`1-1.8.3`, SAL4],
    [`1-2.8.0`, SAS4],
  ] as const;

  log({
    msg: 'counters',
    legacyCounters,
    registersCounters,
  });

  const enmonApiClient = new EnmonApiClient(config.wattrouter.enmon.env);

  try {
    const result = await enmonApiClient.postMeterPlainCounterMulti({
      customerId,
      token,
      payload: [
        ...legacyCounters.map(([type, counter]) => ({
          date: new Date(),
          devEUI: `${devEUI}-${type}`,
          counter,
        })),
        ...registersCounters.map(([meterRegister, counter]) => ({
          date: new Date(),
          devEUI,
          meterRegister,
          counter,
        })),
      ],
    });
    log({ msg: 'post meter plain counter multiple result', result });
  } catch (e) {
    if (axios.isAxiosError<unknown>(e)) {
      const { statusText, status } = e.response ?? {};
      log({
        msg: 'failed to post multiple meter counters',
        status,
        statusText,
        data: e.response?.data,
      });
    } else {
      throw e;
    }
  }

  const payload = {
    meterRegister: `1-32.7.0`, // voltage on phase L1
    value: measurements.VAC,
  } as const;

  log({ msg: 'voltage on phase L1', payload });

  try {
    const { status, statusText, data } = await enmonApiClient.postMeterPlainValue({
      customerId,
      token,
      payload: {
        date: new Date(),
        devEUI,
        ...payload,
      },
    });
    log({ msg: 'post meter plain value result', status, statusText, data });
  } catch (e) {
    if (axios.isAxiosError<unknown>(e)) {
      const { statusText, status } = e.response ?? {};
      log({
        msg: 'failed to post meter value',
        status,
        statusText,
        data: e.response?.data,
      });
    } else {
      throw e;
    }
  }
}

function createJobTickHandler(logger: Debugger, asyncHandler: () => Promise<unknown>): () => void {
  return function handleJobTick(): void {
    logger({ msg: 'job execution started', at: new Date() });

    asyncHandler()
      .then(() => logger({ msg: 'job execution ended' }))
      .catch((e: unknown) => logger({ msg: 'job tick error', error: e }));
  };
}

const jobs = [
  [
    'temperature',
    new CronJob({
      cronTime: '* * * * *',
      onTick: createJobTickHandler(log.extend('job').extend('temperature'), handleTemperature),
      runOnInit: true,
    }),
  ],
  [
    'wattrouter',
    new CronJob({
      cronTime: '* * * * *',
      onTick: createJobTickHandler(log.extend('job').extend('wattrouter'), handleWattrouter),
      runOnInit: true,
    }),
  ],
] as const;

const handleAppShutdown = (signal: NodeJS.Signals) => {
  log(`received ${signal} signal, stopping all jobs ...`);
  jobs.forEach(([name, job]) => {
    log(`stopping job ${name} ...`);
    job.stop();
    log(`stopped job ${name}`);
  });
  log({ msg: 'all jobs stopped, exiting process ...' });
  process.exit(0);
};

process.once('SIGINT', handleAppShutdown);
process.once('SIGTERM', handleAppShutdown);

log('starting jobs ...');

jobs.forEach(([name, job]) => {
  log(`starting job ${name} ...`);
  job.start();
  log({
    msg: 'job started',
    name,
    nextRun: job.nextDate().toJSDate(),
  });
});
