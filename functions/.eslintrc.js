module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    commonjs: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
    tsconfigRootDir: __dirname
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '**/*.json' // Ignore JSON files.
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    allowImportExportEverywhere: 0,
    camelcase: [
      1,
      {
        properties: 'always'
      }
    ],
    'no-var': 'error',
    'no-alert': 'error',
    eqeqeq: 'error',
    'prefer-const': 'warn',
    'object-shorthand': 'warn'
  }
}
