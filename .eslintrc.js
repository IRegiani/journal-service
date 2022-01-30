module.exports = {
  env: {
    es6: true,
    jest: true,
  },
  extends: ['airbnb-base', 'plugin:security/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['async-await', 'promise', 'security'],
  rules: {
    indent: ['error', 2],
    'max-len': ['error', { code: 180 }],
    'import/prefer-default-export': 'off',
    'object-curly-newline': ['off'],
    'no-underscore-dangle': ['off'],
    'global-require': 0,
  },
};
