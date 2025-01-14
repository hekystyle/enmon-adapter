import globals from 'globals';
import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import n from 'eslint-plugin-n';
import vitest from '@vitest/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default tslint.config([
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
  importPlugin.flatConfigs.recommended,
  n.configs['flat/recommended'],
  ...tslint.configs.recommendedTypeChecked,
  ...tslint.configs.stylisticTypeChecked,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2024,
      sourceType: 'module',

      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
          defaultProject: 'tsconfig.json',
        },
      },
    },

    rules: {
      'no-console': 'error',
      'no-underscore-dangle': [
        'error',
        {
          allow: ['_id']
        }
      ],
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
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
  {
    ...vitest.configs.recommended,
    files: ['**/*.spec.ts', '**/*.test.ts', '**/vitest.config.ts'],
  },
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
]);
