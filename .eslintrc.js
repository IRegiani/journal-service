module.exports = {
  env: {
    es6: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['async-await', 'promise'],
  rules: {
    'max-len': ['error', { code: 180 }],
    'import/prefer-default-export': 'off',
    'object-curly-newline': ['off'],
    'no-underscore-dangle': ['off'],
    'global-require': 0,
  },
};
