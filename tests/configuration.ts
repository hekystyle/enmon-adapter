import { Config } from '../src/config/schemas.js';

export default (opts: { dbUri: string }) => (): Config =>
  ({
    DEV: true,
    db: {
      uri: opts.dbUri,
    },
    enmon: {},
    thermometers: [],
    wattrouters: [],
  }) satisfies Config;
