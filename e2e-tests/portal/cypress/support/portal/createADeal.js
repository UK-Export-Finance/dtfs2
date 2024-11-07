const pages = require('../../e2e/pages');

module.exports = (opts) => {
  cy.passRedLine(opts);

  cy.keyboardInput(pages.bankDetails.bankDealId(), opts.bankDealId);
  cy.keyboardInput(pages.bankDetails.bankDealName(), opts.bankDealName);

  cy.clickSubmitButton();
};
