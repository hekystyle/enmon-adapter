import { DynamicModule, Type } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { Thermometer } from './interfaces.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { THERMOMETERS_TOKEN } from './constants.js';

export class ThermometersModule {
  static register(
    thermometers: ReadonlyArray<Type<Thermometer>> = [ThermometerUNI1xxx, ThermometerUNI7xxx],
  ): DynamicModule {
    return {
      module: ThermometersModule,
      imports: [EnmonModule],
      providers: [
        TasksService,
        ...thermometers.map(t => ({
          provide: t,
          useClass: t,
        })),
        {
          provide: THERMOMETERS_TOKEN,
          inject: [...thermometers],
          useFactory: (...services: Thermometer[]) => services,
        },
      ],
    };
  }
}
