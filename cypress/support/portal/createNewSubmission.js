const pages = require('../../integration/pages');

module.exports = (opts) => {
  cy.login(opts);

  pages.startNow.createNewSubmission().click();
}
