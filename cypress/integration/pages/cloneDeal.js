const page = {
  bankDealIdInput: () => cy.get('[data-cy="bank-deal-id"]'),
  bankDealNameInput: () => cy.get('[data-cy="bank-deal-name"]'),
  submit: () => cy.get('button'),
};

module.exports = page;
