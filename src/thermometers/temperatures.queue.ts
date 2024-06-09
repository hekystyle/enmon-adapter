import { Queue } from 'bull';

export type TemperaturesQueue = Queue<void>;

export const TEMPERATURES_QUEUE_NAME = 'temperatures';

export const FETCH_JOB_NAME = 'fetch';
