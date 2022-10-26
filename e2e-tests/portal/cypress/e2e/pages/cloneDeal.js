const page = {
  bankInternalRefNameInput: () => cy.get('[data-cy="bank-supply-contract-id"]'),
  additionalRefNameInput: () => cy.get('[data-cy="bank-supply-contract-name"]'),
  cloneTransactionsInput: () => cy.get('[data-cy="clone-transactions"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
};

module.exports = page;
