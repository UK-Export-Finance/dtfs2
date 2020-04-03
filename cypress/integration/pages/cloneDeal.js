const page = {
  bankSupplyContractIDInput: () => cy.get('[data-cy="bank-supply-contract-id"]'),
  supplyContractNameInput: () => cy.get('[data-cy="bank-supply-contract-name"]'),
  cloneTransactionsInput: () => cy.get('[data-cy="clone-transactions"]'),
  submit: () => cy.get('button'),
};

module.exports = page;
