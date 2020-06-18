const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}`),
  editDealName: () => cy.get('[data-cy="EditDealName"]'),
  eligibilityStatus: () => cy.get('[data-cy="eligibility-status"]'),
  eligibilityCriteriaLink: () => cy.get('[data-cy="ViewDetails"]'),
  aboutSupplierDetailsStatus: () => cy.get('[data-cy="aboutSupplierDetailsStatus"]'),
  aboutSupplierDetailsLink: () => cy.get('[data-cy="ViewAboutSupplierDetails"]'),
  bankSupplyContractName: () => cy.get('[data-cy="bankSupplyContractName"]'),
  bankSupplyContractID: () => cy.get('[data-cy="bankSupplyContractID"]'),
  ukefDealId: () => cy.get('[data-cy="ukefDealId"]'),
  status: () => cy.get('[data-cy="status"]'),
  previousStatus: () => cy.get('[data-cy="previousStatus"]'),
  maker: () => cy.get('[data-cy="maker"]'),
  checker: () => cy.get('[data-cy="checker"]'),
  submissionDate: () => cy.get('[data-cy="submissionDate"]'),
  dateOfLastAction: () => cy.get('[data-cy="dateOfLastAction"]'),
  submissionType: () => cy.get('[data-cy="submissionType"]'),
  cloneDealLink: () => cy.get('[data-cy="clone-deal-link"]'),
  addBondButton: () => cy.get('[data-cy="button-add-bond"]'),
  addLoanButton: () => cy.get('[data-cy="button-add-loan"]'),

  pleaseCompleteAllForms: () => cy.get('[data-cy="pleaseCompleteAllForms"]'),
  canProceed: () => cy.get('[data-cy="canProceed"]'),
  reviewEligibilityChecklistForm: () => cy.get('[data-cy="reviewEligibilityChecklistForm"]'),
  cannotProceed: () => cy.get('[data-cy="cannotProceed"]'),

  abandonButton: () => cy.get('[data-cy="Abandon"]'),
  abandonLink: () => cy.get('[data-cy="AbandonLink"]'),
  proceedToReview: () => cy.get('[data-cy="ProceedToReview"]'),
  proceedToSubmit: () => cy.get('[data-cy="ProceedToSubmit"]'),
  returnToMaker: () => cy.get('[data-cy="ReturnToMaker"]'),
  eligibilitySubmissionType: () => cy.get('[data-cy="eligibility-submission-type"]'),
  bondTransactionsTable: {
    row: (bondId) => {
      const row = cy.get(`[data-cy="bond-${bondId}"]`);
      return {
        uniqueNumber: () => row.get('[data-cy="unique-number"]'),
        bondStatus: () => row.get('[data-cy="bond-status"]'),
        facilityValue: () => row.get('[data-cy="bond-facility-value"]'),
        bondStage: () => row.get('[data-cy="bond-stage"]'),
        requestedCoverStartDate: () => row.get('[data-cy="bond-requested-cover-start-date"]'),
        coverEndDate: () => row.get('[data-cy="bond-cover-end-date"]'),
        deleteLink: () => row.get(`[data-cy="delete-bond-${bondId}"]`),
      };
    },
  },
  loansTransactionsTable: {
    row: (loanId) => {
      const row = cy.get(`[data-cy="loan-${loanId}"]`);
      return {
        bankReferenceNumber: () => row.get('[data-cy="loan-bank-reference-number"]'),
        loanStatus: () => row.get('[data-cy="loan-status"]'),
        facilityValue: () => row.get('[data-cy="loan-facility-value"]'),
        facilityStage: () => row.get('[data-cy="loan-facility-stage"]'),
        requestedCoverStartDate: () => row.get('[data-cy="loan-requested-cover-start-date"]'),
        coverEndDate: () => row.get('[data-cy="loan-cover-end-date"]'),
      };
    },
  },
};

module.exports = page;
