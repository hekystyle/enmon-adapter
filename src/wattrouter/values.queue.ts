import { Queue } from 'bull';

export const VALUES_QUEUE_NAME = 'values';

export type FetchJobData = undefined;

export type ValuesQueue = Queue<FetchJobData>;

export const FETCH_JOB_NAME = 'fetch';
