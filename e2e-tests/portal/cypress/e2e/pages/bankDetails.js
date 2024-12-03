const page = {
  visit: () => cy.visit('/before-you-start/bank-deal'),
  bankDealId: () => cy.get('[data-cy="bankInternalRefName"]'),
  bankDealIdCount: () => cy.get('#bankInternalRefName-info + .govuk-character-count__message'),
  bankDealName: () => cy.get('[data-cy="additionalRefName"]'),
  bankDealNameCount: () => cy.get('#additionalRefName-info + .govuk-character-count__message'),
  cancel: () => cy.get('[data-cy="Cancel"]'),
};

module.exports = page;
