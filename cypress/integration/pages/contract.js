const page = {
  supplyContractName: () => cy.get('#supplyContractName'),
  bankSupplyContractID: () => cy.get('#bankSupplyContractID'),
  eligibilityCriteriaLink: () => cy.get('#eligibilityCriteriaLink'),
};

module.exports = page;
