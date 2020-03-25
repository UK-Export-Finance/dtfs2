const pages = require('../pages');
const login = require('./login');

module.exports = (opts) => {
  login(opts);

  pages.startNow.createNewSubmission().click();
}
