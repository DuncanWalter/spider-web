module.exports = {
  overrides: [
    // src files
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'prettier/react',
        'plugin:react/recommended',
      ],
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {
        'no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'react/display-name': 'off',
        // fixme
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    // nodejs config files
    {
      files: '*.js',
      parser: '@typescript-eslint/parser',
      env: {
        node: true,
        es6: true,
      },
      extends: ['eslint:recommended', 'prettier'],
    },
  ],
}
