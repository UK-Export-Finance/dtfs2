const amendmentsPage = {
  amendmentRequestHeading: () => cy.get('[data-cy="amendment--request-heading"]'),
  amendmentRequestHint: () => cy.get('[data-cy="amendments--request-hint"]'),
  amendmentRequestDayInput: () => cy.get('[data-cy="amendment--request-date-day"]'),
  amendmentRequestMonthInput: () => cy.get('[data-cy="amendment--request-date-month"]'),
  amendmentRequestYearInput: () => cy.get('[data-cy="amendment--request-date-year"]'),

  amendmentCoverEndDateDayInput: () => cy.get('[data-cy="amendment--cover-end-date-day"]'),
  amendmentCoverEndDateMonthInput: () => cy.get('[data-cy="amendment--cover-end-date-month"]'),
  amendmentCoverEndDateYearInput: () => cy.get('[data-cy="amendment--cover-end-date-year"]'),
  amendmentFacilityValueInput: () => cy.get('[data-cy="amendment--facility-value"]'),
  amendmentCurrentFacilityValue: () => cy.get('[data-cy="amendment--current-facility-value"]'),

  amendmentEffectiveDayInput: () => cy.get('[data-cy="amendment--effective-date-day"]'),
  amendmentEffectiveMonthInput: () => cy.get('[data-cy="amendment--effective-date-month"]'),
  amendmentEffectiveYearInput: () => cy.get('[data-cy="amendment--effective-date-year"]'),
  amendmentCurrentCoverEndDate: () => cy.get('[data-cy="amendment--current-cover-end-date"]'),

  amendmentCoverEndDateCheckbox: () => cy.get('[data-cy="amendment--coverEndDate-checkbox"]'),
  amendmentFacilityValueCheckbox: () => cy.get('[data-cy="amendment--facilityValue-checkbox"]'),

  errorSummary: () => cy.get('[data-cy="amendment--error-summary"]'),
  errorMessage: () => cy.get('[data-cy="amendment--inline-error"]'),

  amendmentRequestApprovalYes: () => cy.get('[data-cy="amendment--request-approval-yes"]'),
  amendmentRequestApprovalNo: () => cy.get('[data-cy="amendment--request-approval-no"]'),

  addAmendmentButton: () => cy.get('[data-cy="amendment--add-amendment-button"]'),
  continueAmendmentButton: () => cy.get('[data-cy="amendment--continue-amendment-button"]'),
  continueAmendment: () => cy.get('[data-cy="amendment--continue-button"]'),
  cancelLink: () => cy.get('[data-cy="amendment--cancel-button"]'),

  amendmentAnswerBankRequestDate: () => cy.get('[data-cy="amendment--bank-request-date-response"]'),
  amendmentAnswerRequireApproval: () => cy.get('[data-cy="amendment--require-approval-response"]'),
  amendmentAnswerEffectiveDate: () => cy.get('[data-cy="amendment--effective-date-response"]'),
  amendmentAnswerCoverEndDate: () => cy.get('[data-cy="amendment--cover-end-date-response"]'),
  amendmentAnswerFacilityValue: () => cy.get('[data-cy="amendment--facility-value-response"]'),

};

module.exports = amendmentsPage;
