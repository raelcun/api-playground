module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['plugin:prettier/recommended'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint'],
      plugins: ['simple-import-sort'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'simple-import-sort/sort': [
          'error',
          {
            groups: [
              // external packages
              ['^[^@]\\w'],

              // alias packages
              ['^@\\w'],

              // relative imports
              ['^\\.'],
            ],
          },
        ],
      },
    },
  ],
}
