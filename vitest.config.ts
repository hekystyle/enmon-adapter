import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/env-setup.ts'],
  },
});
