const pages = require('../../e2e/pages');

module.exports = (opts) => {
  cy.createBSSSubmission(opts);

  pages.beforeYouStart.true().click();
  pages.beforeYouStart.submit().click();
};
