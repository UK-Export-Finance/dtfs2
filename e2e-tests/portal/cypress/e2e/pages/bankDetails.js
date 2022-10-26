const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('[data-cy="bankInternalRefName"]'),
  bankDealIdCount: () => cy.get('[data-cy="bankInternalRefName-count"]'),
  bankDealName: () => cy.get('[data-cy="additionalRefName"]'),
  bankDealNameCount: () => cy.get('[data-cy="additionalRefName-count"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  cancel: () => cy.get('[data-cy="Cancel"]'),
};

module.exports = page;
