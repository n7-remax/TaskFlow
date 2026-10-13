/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['repo', 'config', 'contracts', 'api', 'web', 'db', 'ci', 'deps']],
    'body-max-line-length': [1, 'always', 100],
  },
};

export default config;
