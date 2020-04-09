const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}`),
  editDealName: () => cy.get('[data-cy="EditDealName"]'),
  eligibilityCriteriaLink: () => cy.get('[data-cy="ViewDetails"]'),
  bankSupplyContractName: () => cy.get('[data-cy="bankSupplyContractName"]'),
  bankSupplyContractID: () => cy.get('[data-cy="bankSupplyContractID"]'),
  ukefDealId: ()=> cy.get('[data-cy="ukefDealId"]'),
  status: ()=> cy.get('[data-cy="status"]'),
  previousStatus: ()=> cy.get('[data-cy="previousStatus"]'),
  maker: ()=> cy.get('[data-cy="maker"]'),
  checker: ()=> cy.get('[data-cy="checker"]'),
  submissionDate: ()=> cy.get('[data-cy="submissionDate"]'),
  dateOfLastAction: ()=> cy.get('[data-cy="dateOfLastAction"]'),
  submissionType: ()=> cy.get('[data-cy="submissionType"]'),
  cloneDealLink: () => cy.get('[data-cy="clone-deal-link"]'),

  abandon: () => cy.get('[data-cy="Abandon"]'),
  proceedToReview: () => cy.get('[data-cy="ProceedToReview"]'),
  proceedToSubmit: () => cy.get('[data-cy="ProceedToSubmit"]'),
  returnToMaker: () => cy.get('[data-cy="ReturnToMaker"]'),
};

module.exports = page;
