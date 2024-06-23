import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier/recommended'
import n from 'eslint-plugin-n';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default [
  {
    ignores: [
      '**/.github',
      '**/.vscode',
      '**/.yarn',
      '**/coverage',
      '**/k8s',
      '**/dist',
      '**/node_modules',
      'eslint.config.mjs',
    ],
  },
  eslint.configs.recommended,
  n.configs['flat/recommended'],
  ...compat.extends(
    'airbnb-base',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'airbnb-typescript/base',
  ),
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2021,
      sourceType: 'module',

      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },

    rules: {
      'import/prefer-default-export': 'off',
      'n/no-missing-import': 'off',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/member-ordering': 'error',

      '@typescript-eslint/no-empty-function': [
        'error',
        {
          allow: ['private-constructors'],
        },
      ],

      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
          readonly: 'array-simple',
        },
      ],

      '@typescript-eslint/no-redeclare': 'off',
    },
  },
  ...compat.extends('plugin:vitest/recommended').map(config => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.test.ts', '**/vitest.config.ts'],
  })),
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/vitest.config.ts'],

    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },
];
