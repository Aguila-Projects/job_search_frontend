module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', Infinity],
    'footer-max-line-length': [1, 'always', Infinity],
    'subject-case': [2, 'always', ['sentence-case', 'lower-case']],
  },
}
