import { Injectable } from '@nestjs/common';

interface Register {
  register: string;
}

@Injectable()
export class RegistersMapper {
  static remap<T extends Register>(
    map: Map<string, string>,
    readings: readonly T[],
  ): { readings: T[]; unusedMappings: string[] } {
    const unusedKeys = new Set(map.keys());

    const remapped = readings.map(reading => {
      unusedKeys.delete(reading.register);

      return map.has(reading.register)
        ? { ...reading, register: map.get(reading.register) ?? reading.register }
        : reading;
    });

    return {
      readings: remapped,
      unusedMappings: Array.from(unusedKeys.values()),
    };
  }
}
