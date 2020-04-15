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
  addBondButton: () => cy.get('[data-cy="button-add-bond"]'),

  canProceed: () => cy.get('[data-cy="canProceed"]'),
  reviewEligibilityChecklistForm: () => cy.get('[data-cy="reviewEligibilityChecklistForm"]'),
  cannotProceed: () => cy.get('[data-cy="cannotProceed"]'),

  abandon: () => cy.get('[data-cy="Abandon"]'),
  proceedToReview: () => cy.get('[data-cy="ProceedToReview"]'),
  proceedToSubmit: () => cy.get('[data-cy="ProceedToSubmit"]'),
  returnToMaker: () => cy.get('[data-cy="ReturnToMaker"]'),
  bondTransactionsTable: {
    row: (bondId) => {
      const row = cy.get(`[data-cy="bond-${bondId}"]`);
      return {
        uniqueNumber: () => row.get('[data-cy="unique-number"]'),
        bondValue: () => row.get('[data-cy="bond-value"]'),
        requestedCoverStartDate: () => row.get('[data-cy="requested-cover-start-date"]'),
        coverEndDate: () => row.get('[data-cy="cover-end-date"]'),
        deleteLink: () => row.get('[data-cy="delete-link"]'),
      };
    },
  },
};

module.exports = page;
