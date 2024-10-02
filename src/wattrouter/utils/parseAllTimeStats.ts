import { parseStringPromise, processors } from 'xml2js';
import { type AllTimeStats, allTimeStatsSchema } from '../all-time-stats.schema.js';

export const parseAllTimeStats = async (xml: string): Promise<AllTimeStats> => {
  const plain: unknown = await parseStringPromise(xml, {
    explicitArray: false,
    explicitRoot: false,
    valueProcessors: [processors.parseNumbers],
  });
  return await allTimeStatsSchema.parseAsync(plain);
};
