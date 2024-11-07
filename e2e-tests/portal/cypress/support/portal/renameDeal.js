const pages = require('../../e2e/pages');

module.exports = (opts) => {
  const { deal, newName } = opts;

  pages.contract.visit(deal);
  pages.contract.editDealName().click();

  cy.keyboardInput(pages.editDealName.additionalRefName(), `{selectall}{backspace}${newName}`);

  cy.clickSubmitButton();
};
