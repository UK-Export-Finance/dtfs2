const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('[data-cy="bankSupplyContractID"]'),
  bankDealName: () => cy.get('[data-cy="bankSupplyContractName"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),
  bondSupportScheme: () => '//TODO',
  exportWorkingCapitalScheme: () => '//TODO',
};

module.exports = page;
