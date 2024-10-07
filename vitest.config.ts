import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/env-setup.ts'],
    include: ['**/*.e2e-spec.?(c|m)[jt]s?(x)', ...configDefaults.include],
  },
});
