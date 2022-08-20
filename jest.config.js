/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[t]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/env-setup.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    // ESM support (https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/)
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
