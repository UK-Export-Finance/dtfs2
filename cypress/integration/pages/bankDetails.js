const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('[data-cy="bankDealId"]'),
  bankDealName: () => cy.get('[data-cy="bankDealName"]'),
  create: () => cy.get('[data-cy="Create"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),
  bondSupportScheme: () => '//TODO',
  exportWorkingCapitalScheme: () => '//TODO',
};

module.exports = page;
