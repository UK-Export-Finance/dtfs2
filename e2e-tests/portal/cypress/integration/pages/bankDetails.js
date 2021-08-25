const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('[data-cy="bankSupplyContractID"]'),
  bankDealIdCount: () => cy.get('[data-cy="bankSupplyContractID-count"]'),
  bankDealName: () => cy.get('[data-cy="bankSupplyContractName"]'),
  bankDealNameCount: () => cy.get('[data-cy="bankSupplyContractName-count"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),
};

module.exports = page;
