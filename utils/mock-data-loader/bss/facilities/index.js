/* eslint-disable global-require */
module.exports = [
  ...require('./facilities-to-not-submit-to-tfm'),
  ...require('./facilities-to-submit-to-tfm'),
];
