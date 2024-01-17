/* eslint-disable global-require */

const dealsToSubmitToTfm = require('./deals-to-submit-to-tfm');
const dealsNotToSubmit = [
  require('./1'),
  require('./2'),
  require('./3'),
  require('./4'),
  require('./5'),
  require('./6'),
  require('./7'),
  require('./8'),
  require('./9'),
  require('./10'),
  require('./11'),
];

module.exports = {
  dealsToSubmitToTfm,
  dealsNotToSubmit,
};
