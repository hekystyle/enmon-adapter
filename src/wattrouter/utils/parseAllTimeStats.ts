import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AllTimeStats, AllTimeStatsShape } from '../types.js';

export const parseAllTimeStats = async (plain: unknown): Promise<AllTimeStats> => {
  const instance = plainToInstance(AllTimeStatsShape, plain);
  await validateOrReject(instance);
  return instance.stat_alltime;
};
