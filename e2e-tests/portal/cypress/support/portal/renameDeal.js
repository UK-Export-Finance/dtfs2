const pages = require('../../e2e/pages');

module.exports = (opts) => {
  const { deal, newName } = opts;

  pages.contract.visit(deal);
  pages.contract.editDealName().click();

  pages.editDealName.additionalRefName().type(`{selectall}{backspace}${newName}`);
  pages.editDealName.submit().click();
};
