const page = {
  supplyContractName: () => cy.get('[data-cy="supply-contract-name"]'),
  bankSupplyContractID: () => cy.get('[data-cy="bank-supply-contract-id"]'),
  eligibilityCriteriaLink: () => cy.get('#eligibilityCriteriaLink'),
  cloneDealLink: () => cy.contains('Clone'),
};

module.exports = page;

