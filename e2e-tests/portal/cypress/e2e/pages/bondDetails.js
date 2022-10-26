const page = {
  title: () => cy.get('[data-cy="bond"]'),

  bondDetails: () => cy.get('[data-cy="task-list-link-bond-details"]'),

  bondIssuerInput: () => cy.get('[data-cy="bond-issuer"]'),

  bondTypeInput: () => cy.get('[data-cy="bond-type"]'),
  bondTypeInputErrorMessage: () => cy.get('[data-cy="bond-type-error-message"]'),

  facilityStageUnissuedInput: () => cy.get('[data-cy="facility-stage-unissued"]'),
  facilityStageIssuedInput: () => cy.get('[data-cy="facility-stage-issued"]'),
  facilityStageInputErrorMessage: () => cy.get('[data-cy="facility-stage-error-message"]'),

  // 'unissued' facility stage specifics
  ukefGuaranteeInMonthsInput: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),
  ukefGuaranteeInMonthsInputErrorMessage: () => cy.get('[data-cy="ukef-guarantee-in-months-error-message"]'),

  // 'issued' facility stage specifics
  requestedCoverStartDateDayInput: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  requestedCoverStartDateMonthInput: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  requestedCoverStartDateYearInput: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  requestedCoverStartDateInputErrorMessage: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),

  coverEndDateDayInput: () => cy.get('[data-cy="coverEndDate-day"]'),
  coverEndDateMonthInput: () => cy.get('[data-cy="coverEndDate-month"]'),
  coverEndDateYearInput: () => cy.get('[data-cy="coverEndDate-year"]'),
  coverEndDateInputErrorMessage: () => cy.get('[data-cy="coverEndDate-error-message"]'),

  nameInput: () => cy.get('[data-cy="name"]'),
  nameInputErrorMessage: () => cy.get('[data-cy="name-error-message"]'),

  // always present in page
  bondBeneficiaryInput: () => cy.get('[data-cy="bond-beneficiary"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
