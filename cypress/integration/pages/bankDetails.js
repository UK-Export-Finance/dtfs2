const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('#bankDealId'),
  bankDealName: () => cy.get('#bankDealName'),
  create: () => cy.get('button'),
  cancel: () => '//TODO',
  bondSupportScheme: () => '//TODO',
  exportWorkingCapitalScheme: () => '//TODO',
};

module.exports = page;
