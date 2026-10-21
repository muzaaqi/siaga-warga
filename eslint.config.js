//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import { plugin as shadcn } from '@shadcn/lint'

export default [
  ...tanstackConfig,
  {
    plugins: {
      shadcn,
    },
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'shadcn/no-restyle': [
        'error',
        {
          allow: ['layout'],
        },
      ],
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'routeTree.gen.ts',
      'src/routeTree.gen.ts',
      'dist/**',
      '.output/**',
      '.vinxi/**',
      '.tanstack/**',
      '.wrangler/**',
    ],
  },
]
