import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { parseStringPromise } from 'xml2js';
import { Measurement, MeasurementShape } from '../types.js';

export const parseMeasurement = async (xml: string): Promise<Measurement> => {
  const plain: unknown = await parseStringPromise(xml, { explicitArray: false });
  const instance = plainToInstance(MeasurementShape, plain);
  await validateOrReject(instance);
  return instance.meas;
};
