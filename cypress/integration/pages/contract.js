const page = {
  supplyContractName: () => cy.get('[data-cy="supply-contract-name"]'),
  bankSupplyContractID: () => cy.get('[data-cy="bank-supply-contract-id"]'),
  eligibilityCriteriaLink: () => cy.get('#eligibilityCriteriaLink'),
  cloneDealLink: () => cy.contains('Clone'),
  ukefDealId: () => cy.get('#ukefDealId'),
  status: () => cy.get('#status'),
  previousStatus: () => cy.get('#previousStatus'),
  maker: () => cy.get('#maker'),
  checker: () => cy.get('#checker'),
  submissionDate: () => cy.get('#submissionDate'),
  dateOfLastAction: () => cy.get('#dateOfLastAction'),
  submissionType: () => cy.get('#submissionType'),
};

module.exports = page;

