const page = {
  // Facility stage = Conditional specifics
  facilityStageConditionalInput: () => cy.get('[data-cy="facility-stage-conditional"]'),
  facilityStageUnconditionalInput: () => cy.get('[data-cy="facility-stage-unconditional"]'),
  facilityStageErrorMessage: () => cy.get('[data-cy="facility-stage-error-message"]'),

  conditionalBankReferenceNumberInput: () => cy.get('[data-cy="facilityStageConditional-bankReferenceNumber"]'),
  ukefGuaranteeInMonthsInput: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),
  ukefGuaranteeInMonthsErrorMessage: () => cy.get('[data-cy="ukef-guarantee-in-months-error-message"]'),

  // Facility stage = Unconditional specifics
  unconditionalBankReferenceNumberInput: () => cy.get('[data-cy="facilityStageUnconditional-bankReferenceNumber"]'),
  unconditionalBankReferenceNumberErrorMessage: () => cy.get('[data-cy="facilityStageUnconditional-bankReferenceNumber-error-message"]'),
  requestedCoverStartDateDayInput: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  requestedCoverStartDateMonthInput: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  requestedCoverStartDateYearInput: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  requestedCoverStartDateErrorMessage: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),

  coverEndDateDayInput: () => cy.get('[data-cy="coverEndDate-day"]'),
  coverEndDateMonthInput: () => cy.get('[data-cy="coverEndDate-month"]'),
  coverEndDateYearInput: () => cy.get('[data-cy="coverEndDate-year"]'),
  coverEndDateErrorMessage: () => cy.get('[data-cy="coverEndDate-error-message"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
