import { parseStringPromise } from 'xml2js';
import { type Measurement, measurementShapeSchema } from '../schemas.js';

export const parseMeasurement = async (xml: string): Promise<Measurement> => {
  const plain: unknown = await parseStringPromise(xml, { explicitArray: false });
  const instance = await measurementShapeSchema.parseAsync(plain);
  return instance.meas;
};
