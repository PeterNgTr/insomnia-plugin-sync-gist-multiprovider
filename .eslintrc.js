module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  plugins: ['jest'],
  extends: [
    'airbnb-base', 'eslint:recommended', 'plugin:jest/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-console': 0,
    'no-new': 0,
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: { 'jest/globals': true },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/no-conditional-expect': 0,
      },
    },
  ],
};
