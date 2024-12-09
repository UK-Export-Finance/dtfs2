const page = {
  bankInternalRefNameInput: () => cy.get('[data-cy="bank-supply-contract-id"]'),
  bankInternalRefNameHint: () => cy.get('[data-cy="bank-supply-contract-id-hint"]'),
  additionalRefNameInput: () => cy.get('[data-cy="bank-supply-contract-name"]'),
  cloneTransactionsInput: () => cy.get('[data-cy="clone-transactions"]'),
};

module.exports = page;
