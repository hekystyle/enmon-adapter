/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[t]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/env-setup.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    // ESM support (https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/)
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
