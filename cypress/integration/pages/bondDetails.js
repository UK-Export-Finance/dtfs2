const page = {
  bondIssuerInput: () => cy.get('[data-cy="bond-issuer"]'),

  bondTypeInput: () => cy.get('[data-cy="bond-type"]'),
  bondTypeInputErrorMessage: () => cy.get('[data-cy="bond-type-error-message"]'),

  bondStageUnissuedInput: () => cy.get('[data-cy="bond-stage-unissued"]'),
  bondStageIssuedInput: () => cy.get('[data-cy="bond-stage-issued"]'),
  bondStageInputErrorMessage: () => cy.get('[data-cy="bond-stage-error-message"]'),

  // 'unissued' bond stage specifics
  ukefGuaranteeInMonthsInput: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),
  ukefGuaranteeInMonthsInputErrorMessage: () => cy.get('[data-cy="ukef-guarantee-in-months-error-message"]'),

  // 'issued' bond stage specifics
  requestedCoverStartDateDayInput: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  requestedCoverStartDateMonthInput: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  requestedCoverStartDateYearInput: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  requestedCoverStartDateInputErrorMessage: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),

  coverEndDateDayInput: () => cy.get('[data-cy="coverEndDate-day"]'),
  coverEndDateMonthInput: () => cy.get('[data-cy="coverEndDate-month"]'),
  coverEndDateYearInput: () => cy.get('[data-cy="coverEndDate-year"]'),
  coverEndDateInputErrorMessage: () => cy.get('[data-cy="coverEndDate-error-message"]'),

  uniqueIdentificationNumberInput: () => cy.get('[data-cy="unique-identification-number"]'),
  uniqueIdentificationNumberInputErrorMessage: () => cy.get('[data-cy="unique-identification-number-error-message"]'),

  // always present in page
  bondBeneficiaryInput: () => cy.get('[data-cy="bond-beneficiary"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
