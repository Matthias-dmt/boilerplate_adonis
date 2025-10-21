module.exports = {
  root: true,
  env: {
    node: true,
    es2024: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // must be last to disable eslint formatting rules
  ],
  rules: {
    // ---- General ----
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',

    // ---- TypeScript ----
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],

    // ---- Imports ----
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: '#*/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-duplicates': 'error',

    // ---- Misc ----
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
  },
  ignorePatterns: ['node_modules', 'build', 'dist', '.adonisjs'],
}