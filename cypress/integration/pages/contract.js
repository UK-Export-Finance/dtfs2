const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}`),
  editDealName: () => cy.get('[data-cy="EditDealName"]'),
  eligibilityCriteriaLink: () => cy.get('[data-cy="ViewDetails"]'),
  supplyContractName: () => cy.get('[data-cy="supplyContractName"]'),
  bankSupplyContractID: () => cy.get('[data-cy="bankSupplyContractID"]'),
  ukefDealId: ()=> cy.get('[data-cy="ukefDealId"]'),
  status: ()=> cy.get('[data-cy="status"]'),
  previousStatus: ()=> cy.get('[data-cy="previousStatus"]'),
  maker: ()=> cy.get('[data-cy="maker"]'),
  checker: ()=> cy.get('[data-cy="checker"]'),
  submissionDate: ()=> cy.get('[data-cy="submissionDate"]'),
  dateOfLastAction: ()=> cy.get('[data-cy="dateOfLastAction"]'),
  submissionType: ()=> cy.get('[data-cy="submissionType"]'),
};

module.exports = page;

