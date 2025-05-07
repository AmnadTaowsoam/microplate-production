// eslint.config.mjs
import { FlatCompat } from 'eslint-define-config';
const compat = FlatCompat({ baseDirectory: __dirname });

export default [
  // extend existing configs
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next',
    'next/core-web-vitals',
    'prettier'
  ),

  // override for TS/TSX files
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react:               require('eslint-plugin-react'),
      'react-hooks':       require('eslint-plugin-react-hooks'),
      'jsx-a11y':          require('eslint-plugin-jsx-a11y'),
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
