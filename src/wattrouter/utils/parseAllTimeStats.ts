import { type AllTimeStats, allTimeStatsShapeSchema } from '../schemas.js';

export const parseAllTimeStats = async (plain: unknown): Promise<AllTimeStats> => {
  const instance = await allTimeStatsShapeSchema.parseAsync(plain);
  return instance.stat_alltime;
};
