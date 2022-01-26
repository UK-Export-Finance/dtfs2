const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}`),
  commentsTab: () => cy.get('[data-cy="comments-tab"]'),
  checkDealDetailsTab: () => cy.get('[data-cy="check-deal-details-tab"]'),

  editDealName: () => cy.get('[data-cy="EditDealName"]'),
  eligibilityStatus: () => cy.get('[data-cy="eligibility-status"]'),
  eligibilityCriteriaLink: () => cy.get('[data-cy="ViewDetails"]'),
  aboutSupplierDetailsStatus: () => cy.get('[data-cy="aboutSupplierDetailsStatus"]'),
  aboutSupplierDetailsLink: () => cy.get('[data-cy="ViewAboutSupplierDetails"]'),
  additionalRefName: () => cy.get('[data-cy="additionalRefName"]'),
  bankInternalRefName: () => cy.get('[data-cy="bankInternalRefName"]'),
  ukefDealId: () => cy.get('[data-cy="ukefDealId"]'),
  status: () => cy.get('[data-cy="status"]'),
  previousStatus: () => cy.get('[data-cy="previousStatus"]'),
  maker: () => cy.get('[data-cy="maker"]'),
  checker: () => cy.get('[data-cy="checker"]'),
  submissionDateTableHeader: () => cy.get('[data-cy="submissionDateHeader"]'),
  submissionDate: () => cy.get('[data-cy="submissionDate"]'),
  updatedAt: () => cy.get('[data-cy="updatedAt"]'),
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
      cy.get(`[data-cy="bond-${bondId}"]`).as('row');
      return {
        uniqueNumber: () => cy.get('@row').get(`[data-cy="name-${bondId}"]`),
        uniqueNumberLink: () => cy.get('@row').get(`[data-cy="name-link-${bondId}"]`),
        ukefFacilityId: () => cy.get('@row').get(`[data-cy="bond-ukef-facility-id-${bondId}"]`),
        bondStatus: () => cy.get('@row').get(`[data-cy="bond-status-${bondId}"]`),
        facilityValue: () => cy.get('@row').get('[data-cy="bond-facility-value"]'),
        facilityStage: () => cy.get('@row').get(`[data-cy="facility-stage-${bondId}"]`),
        requestedCoverStartDate: () => cy.get('@row').get('[data-cy="bond-requested-cover-start-date"]'),
        coverEndDate: () => cy.get('@row').get('[data-cy="bond-cover-end-date"]'),
        issueFacilityLink: () => cy.get('@row').get(`[data-cy="bond-issue-facility-${bondId}"]`),
        deleteLink: () => cy.get('@row').get(`[data-cy="bond-delete-${bondId}"]`),
        changeOrConfirmCoverStartDateLink: () => cy.get('@row').get(`[data-cy="bond-change-or-confirm-cover-start-date-${bondId}"]`),
      };
    },
  },
  loansTransactionsTableRows: () => cy.get('[data-cy="loan-transactions-table"] tbody tr'),
  loansTransactionsTable: {
    row: (loanId) => {
      cy.get(`[data-cy="loan-${loanId}"]`).as('row');
      return {
        bankReferenceNumber: () => cy.get('@row').get(`[data-cy="loan-bank-reference-number-${loanId}"]`),
        bankReferenceNumberLink: () => cy.get('@row').get(`[data-cy="loan-bank-reference-number-link-${loanId}"]`),
        ukefFacilityId: () => cy.get('@row').get(`[data-cy="loan-ukef-facility-id-${loanId}"]`),
        loanStatus: () => cy.get('@row').get(`[data-cy="loan-status-${loanId}"]`),
        facilityValue: () => cy.get('@row').get('[data-cy="loan-facility-value"]'),
        facilityStage: () => cy.get('@row').get(`[data-cy="loan-facility-stage-${loanId}"]`),
        requestedCoverStartDate: () => cy.get('@row').get('[data-cy="loan-requested-cover-start-date"]'),
        coverEndDate: () => cy.get('@row').get('[data-cy="loan-cover-end-date"]'),
        issueFacilityLink: () => cy.get('@row').get(`[data-cy="loan-issue-facility-${loanId}"]`),
        deleteLink: () => cy.get('@row').get(`[data-cy="loan-delete-${loanId}"]`),
        changeOrConfirmCoverStartDateLink: () => cy.get('@row').get(`[data-cy="loan-change-or-confirm-cover-start-date-${loanId}"]`),
      };
    },
  },
};

module.exports = page;
