const page = {
  eligibilityCriteriaLink: () => cy.get('#eligibilityCriteriaLink'),
  supplyContractName: () => cy.get('#supplyContractName'),
  bankSupplyContractID: () => cy.get('#bankSupplyContractID'),
  ukefDealId: ()=> cy.get('#ukefDealId'),
  status: ()=> cy.get('#status'),
  previousStatus: ()=> cy.get('#previousStatus'),
  maker: ()=> cy.get('#maker'),
  checker: ()=> cy.get('#checker'),
  submissionDate: ()=> cy.get('#submissionDate'),
  dateOfLastAction: ()=> cy.get('#dateOfLastAction'),
  submissionType: ()=> cy.get('#submissionType'),
};

module.exports = page;
