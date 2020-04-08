const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('[data-cy="bankDealId"]'),
  bankDealName: () => cy.get('[data-cy="bankDealName"]'),
  submit: () => cy.get('button'),
  cancel: () => cy.get('[data-cy="Cancel"]'),
  bondSupportScheme: () => '//TODO',
  exportWorkingCapitalScheme: () => '//TODO',
};

module.exports = page;
