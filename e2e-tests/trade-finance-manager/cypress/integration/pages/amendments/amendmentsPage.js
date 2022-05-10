const amendmentsPage = {
  amendmentRequestHeading: () => cy.get('[data-cy="amendment-request-heading"]'),
  amendmentRequestHint: () => cy.get('[data-cy="amendments-request-hint"]'),
  amendmentRequestDayInput: () => cy.get('[data-cy="amendment-request-date-day"]'),
  amendmentRequestMonthInput: () => cy.get('[data-cy="amendment-request-date-month"]'),
  amendmentRequestYearInput: () => cy.get('[data-cy="amendment-request-date-year"]'),

  amendmentEffectiveDayInput: () => cy.get('[data-cy="amendment-effective-date-day"]'),
  amendmentEffectiveMonthInput: () => cy.get('[data-cy="amendment-effective-date-month"]'),
  amendmentEffectiveYearInput: () => cy.get('[data-cy="amendment-effective-date-year"]'),

  amendmentCoverEndDateCheckbox: () => cy.get('[data-cy="amendment--coverEndDate-checkbox"]'),
  amendmentFacilityValueCheckbox: () => cy.get('[data-cy="amendment--facilityValue-checkbox"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  errorMessage: () => cy.get('[data-cy="amendment-inline-error"]'),

  amendmentRequestApprovalYes: () => cy.get('[data-cy="amendment-request-approval-yes"]'),
  amendmentRequestApprovalNo: () => cy.get('[data-cy="amendment-request-approval-no"]'),

  addAmendmentButton: () => cy.get('[data-cy="add-amendment-button"]'),
  continueAmendmentButton: () => cy.get('[data-cy="continue-amendment-button"]'),
  continueAmendment: () => cy.get('[data-cy="continue-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-button"]'),
};

module.exports = amendmentsPage;
