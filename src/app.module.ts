import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaModule } from 'agenda-nest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { EnmonModule } from './enmon/enmon.module.js';
import { ThermometersModule } from './thermometers/thermometers.module.js';
import { WATTrouterModule } from './wattrouter/wattrouter.module.js';
import { AlsModule } from './als/als.module.js';
import configuration from './config/configuration.js';
import { Config } from './config/schemas.js';

@Module({
  imports: [
    AgendaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        processEvery: '15 seconds',
        db: {
          address: config.getOrThrow('db.uri', { infer: true }),
        },
      }),
    }),
    AlsModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        uri: config.getOrThrow('db.uri', { infer: true }),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: false,
    }),
    EnmonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        contactEmail: config.getOrThrow('enmon.contactEmail', { infer: true }),
      }),
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        transports: new winston.transports.Console(),
        format: config.getOrThrow('DEV', { infer: true })
          ? winston.format.prettyPrint({ colorize: true })
          : winston.format.json(),
      }),
    }),
    ThermometersModule,
    WATTrouterModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
