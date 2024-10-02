import { parseStringPromise, processors } from 'xml2js';
import { type Measurement, measurementSchema } from '../measurement.schema.js';

export const parseMeasurement = async (xml: string): Promise<Measurement> => {
  const plain: unknown = await parseStringPromise(xml, {
    explicitArray: false,
    explicitRoot: false,
    valueProcessors: [processors.parseNumbers],
  });
  return await measurementSchema.parseAsync(plain);
};
