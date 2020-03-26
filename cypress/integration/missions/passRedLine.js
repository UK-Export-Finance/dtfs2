const {beforeYouStart} = require('../pages');
const createNewSubmission = require('./createNewSubmission');

module.exports = (opts) => {
  createNewSubmission(opts);

  beforeYouStart.true().click();
  beforeYouStart.submit().click();
}
