const pages = require('../../integration/pages');

module.exports = (opts) => {
  const {deal, newName} = opts;

  pages.contract.visit(deal);
  pages.contract.editDealName().click();

  pages.editDealName.bankSupplyContractName().type(`{selectall}{backspace}${newName}`);
  pages.editDealName.submit().click();
}
