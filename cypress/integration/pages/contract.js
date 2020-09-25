const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}`),
  commentsTab: () => cy.get('[data-cy="comments-tab"]'),
  previewTab: () => cy.get('[data-cy="preview-tab"]'),

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
  submissionDateTableHeader: () => cy.get('[data-cy="submissionDateHeader"]'),
  submissionDate: () => cy.get('[data-cy="submissionDate"]'),
  dateOfLastAction: () => cy.get('[data-cy="dateOfLastAction"]'),
  cloneDealLink: () => cy.get('[data-cy="clone-deal-link"]'),
  addBondButton: () => cy.get('[data-cy="link-add-bond"]'),
  addLoanButton: () => cy.get('[data-cy="link-add-loan"]'),

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
  eligibilityManualInclusionNoticeSubmissionDate: () => cy.get('[data-cy="manual-inclusion-notice-submission-date"]'),
  bondTransactionsTableRows: () => cy.get('[data-cy="bond-transactions-table"] tbody tr'),
  bondTransactionsTable: {
    row: (bondId) => {
      const row = cy.get(`[data-cy="bond-${bondId}"]`);
      return {
        row,
        uniqueNumber: () => row.get(`[data-cy="unique-number-${bondId}"]`),
        uniqueNumberLink: () => row.get(`[data-cy="unique-number-link-${bondId}"]`),
        bondStatus: () => row.get(`[data-cy="bond-status-${bondId}"]`),
        facilityValue: () => row.get('[data-cy="bond-facility-value"]'),
        facilityStage: () => row.get(`[data-cy="facility-stage-${bondId}"]`),
        requestedCoverStartDate: () => row.get('[data-cy="bond-requested-cover-start-date"]'),
        coverEndDate: () => row.get('[data-cy="bond-cover-end-date"]'),
        issueFacilityLink: () => row.get(`[data-cy="bond-issue-facility-${bondId}"]`),
        deleteLink: () => row.get(`[data-cy="bond-delete-${bondId}"]`),
        changeOrConfirmCoverStartDateLink: () => row.get(`[data-cy="bond-change-or-confirm-cover-start-date-${bondId}"]`),
      };
    },
  },
  loansTransactionsTableRows: () => cy.get('[data-cy="loan-transactions-table"] tbody tr'),
  loansTransactionsTable: {
    row: (loanId) => {
      const row = cy.get(`[data-cy="loan-${loanId}"]`);
      return {
        row,
        bankReferenceNumber: () => row.get(`[data-cy="loan-bank-reference-number-${loanId}"]`),
        bankReferenceNumberLink: () => row.get(`[data-cy="loan-bank-reference-number-link-${loanId}"]`),
        loanStatus: () => row.get(`[data-cy="loan-status-${loanId}"]`),
        facilityValue: () => row.get('[data-cy="loan-facility-value"]'),
        facilityStage: () => row.get(`[data-cy="loan-facility-stage-${loanId}"]`),
        requestedCoverStartDate: () => row.get('[data-cy="loan-requested-cover-start-date"]'),
        coverEndDate: () => row.get('[data-cy="loan-cover-end-date"]'),
        issueFacilityLink: () => row.get(`[data-cy="loan-issue-facility-${loanId}"]`),
        deleteLink: () => row.get(`[data-cy="loan-delete-${loanId}"]`),
        changeOrConfirmCoverStartDateLink: () => row.get(`[data-cy="loan-change-or-confirm-cover-start-date-${loanId}"]`),
      };
    },
  },
};

module.exports = page;
