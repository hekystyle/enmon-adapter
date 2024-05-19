import { DynamicModule, Logger, Type } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, Reflector } from '@nestjs/core';
import { DirectorService } from './director.service.js';
import { TemperaturesUploader, Thermometer } from './interfaces.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { THERMOMETERS_TOKEN, TEMPERATURE_UPLOADERS_TOKEN } from './constants.js';
import { TEMPERATURES_UPLOADER_KEY } from './uploader.decorator.js';

export class ThermometersModule {
  static register(
    thermometers: ReadonlyArray<Type<Thermometer>> = [ThermometerUNI1xxx, ThermometerUNI7xxx],
  ): DynamicModule {
    return {
      module: ThermometersModule,
      imports: [DiscoveryModule],
      providers: [
        DirectorService,
        ...thermometers.map(t => ({
          provide: t,
          useClass: t,
        })),
        {
          provide: THERMOMETERS_TOKEN,
          inject: [...thermometers],
          useFactory: (...services: Thermometer[]) => services,
        },
        {
          provide: TEMPERATURE_UPLOADERS_TOKEN,
          inject: [DiscoveryService, Reflector],
          useFactory: (discovery: DiscoveryService, reflector: Reflector): TemperaturesUploader[] => {
            const services = discovery
              .getProviders()
              .filter(provider => {
                if (!provider.metatype) return false;
                const metadata = reflector.get<boolean | undefined>(TEMPERATURES_UPLOADER_KEY, provider.metatype);
                return metadata === true;
              })
              .map(provider => provider.instance as TemperaturesUploader);

            if (services.length === 0) {
              Logger.warn('No temperature uploaders found', ThermometersModule.name);
            } else {
              Logger.log(`Found ${services.length} temperature uploaders`, ThermometersModule.name);
            }

            return services;
          },
        },
      ],
    };
  }
}
