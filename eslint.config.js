'use strict';

const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },

  js.configs.recommended,

  // Back-end : Node.js en CommonJS
  {
    files: ['src/**/*.js', 'tests/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$|^req$' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Tests : variables globales de Jest (describe, test, expect…)
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.jest } },
  },

  // Front : JavaScript vanilla exécuté dans le navigateur
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },

  // Désactive les règles de style qui entreraient en conflit avec Prettier.
  prettier,
];
