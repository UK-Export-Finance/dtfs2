const pages = require('../../integration/pages');

module.exports = (opts) => {
  cy.createNewSubmission(opts);

  pages.beforeYouStart.true().click();
  pages.beforeYouStart.submit().click();
}
