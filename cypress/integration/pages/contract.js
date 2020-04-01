const page = {
  supplyContractName: () => cy.get('#supplyContractName'),
  bankSupplyContractID: () => cy.get('#bankSupplyContractID'),
  eligibilityCriteriaLink: () => cy.get('#eligibilityCriteriaLink'),
  cloneDealLink: () => cy.contains('Clone'),
};

module.exports = page;
