const pages = require('../../e2e/pages');

module.exports = (opts) => {
  cy.passRedLine(opts);

  pages.bankDetails.bankDealId().type(opts.bankDealId);
  pages.bankDetails.bankDealName().type(opts.bankDealName);
  pages.bankDetails.submit().click();
};
