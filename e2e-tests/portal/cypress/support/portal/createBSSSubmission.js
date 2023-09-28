const pages = require('../../e2e/pages');

module.exports = (opts) => {
  cy.login(opts);
  
  pages.serviceOptions.portalLink().click();
  pages.dashboard.createNewSubmission().click();

  pages.selectScheme.bss().click();
  pages.selectScheme.continue().click();
};
