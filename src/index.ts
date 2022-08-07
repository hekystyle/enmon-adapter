import 'dotenv/config';
import debug from 'debug';
import { CronJob } from 'cron';
import config from 'config';
import axios from 'axios';
import { parseTemperature } from './parseTemp.js';
import { EnmonApiClient, EnmonEnv } from './services/enmon.js';
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
  } = await axios.get<string>(config.get('thermometer.dataSourceUrl'), {
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
  const env = config.get<string>('thermometer.enmon.env');
  const customerId = config.get<string>('thermometer.enmon.customerId');

  const { status, statusText, data } = await axios.post<unknown>(
    `https://${env}.enmon.tech/meter/plain/${customerId}/value`,
    {
      devEUI: config.get<string>('thermometer.enmon.devEUI'),
      date: new Date(),
      value: temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${config.get<string>('thermometer.enmon.token')}`,
      },
      validateStatus: () => true,
    },
  );

  log({ msg: 'upload temperature result', status, statusText, data });
}

async function handleTemperature() {
  const temperature = await fetchTemperature();

  if (temperature) await uploadTemperature(temperature);
}

async function getAllTimeStats() {
  const wattrouterApiClient = new WATTrouterMxApiClient(config.get<string>('wattrouter.baseURL'));
  try {
    return await wattrouterApiClient.getAllTimeStats();
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const { statusText, status } = e.response ?? {};
      log({
        msg: 'failed to fetch wattrouter alltime stats',
        status,
        statusText,
        data: e.response?.data,
      });
    } else {
      log({ msg: 'failed to fetch wattrouter alltime stats', error: e });
    }
    return undefined;
  }
}

async function handleWattrouter() {
  const allTimeStats = await getAllTimeStats();
  if (!allTimeStats) return undefined;
  const { SAH4, SAL4, SAP4, SAS4 } = allTimeStats;
  log({
    msg: 'fetched wattrouter alltime stats',
    consumptionHT: SAH4,
    consumptionLT: SAL4,
    production: SAP4,
    surplus: SAS4,
  });

  const customerId = config.get<string>('wattrouter.enmon.customerId');
  const token = config.get<string>('wattrouter.enmon.token');
  const devEUI = config.get<string>('wattrouter.enmon.devEUI');

  const values = [
    [`consumption-ht`, SAH4],
    [`consumption-lt`, SAL4],
    [`production`, SAP4],
    [`surplus`, SAS4],
  ] as const;

  const enmonApiClient = new EnmonApiClient(config.get<EnmonEnv>('wattrouter.enmon.env'));

  try {
    const result = await enmonApiClient.postMeterPlainCounterMulti({
      customerId,
      token,
      payload: values.map(([type, value]) => ({
        date: new Date(),
        devEUI: `${devEUI}-${type}`,
        counter: parseFloat(value),
      })),
    });
    log({ msg: 'post meter plain counter multiple result', result });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const { statusText, status } = e.response ?? {};
      log({
        msg: 'failed to post multiple meter counters',
        status,
        statusText,
        data: e.response?.data,
      });
    } else {
      log({ msg: 'failed to post meter counter', error: e });
    }
    throw e;
  }

  return undefined;
}

async function handleJobTick() {
  log({ msg: 'job execution started', at: new Date() });

  await Promise.all([handleTemperature(), handleWattrouter()]);

  log({ msg: 'job execution ended' });
}

const job = new CronJob({
  cronTime: '* * * * *',
  onTick: handleJobTick,
  runOnInit: true,
});

const handleAppShutdown = () => {
  log({ msg: 'received shutdown signal, shutting down job ...' });
  job.stop();
  log({ msg: 'job shuted down, exiting process ...' });
  process.exit(0);
};

process.once('SIGINT', handleAppShutdown);
process.once('SIGTERM', handleAppShutdown);

log('starting job ...');

job.start();

log({ msg: 'job started', nextRun: job.nextDate().toJSDate() });
