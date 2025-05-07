// .eslintrc.js
module.exports = {
    root: true,
    env: {
      browser: true,
      node:    true,
      es2021:  true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion:  'latest',
      sourceType:   'module',
      ecmaFeatures: { jsx: true },
    },
    settings: {
      react: { version: 'detect' },
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
      'next',
      'next/core-web-vitals',
      'prettier',
    ],
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'jsx-a11y',
    ],
    rules: {
      // your custom rules here
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  };