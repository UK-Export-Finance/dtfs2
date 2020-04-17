const page = {
  bondIssuerInput: () => cy.get('[data-cy="bond-issuer"]'),
  bondTypeInput: () => cy.get('[data-cy="bond-type"]'),
  bondStageUnissuedInput: () => cy.get('[data-cy="bond-stage-unissued"]'),
  bondStageIssuedInput: () => cy.get('[data-cy="bond-stage-issued"]'),
  ukefGuaranteeInMonthsInput: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),
  requestedCoverStartDateDayInput: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  requestedCoverStartDateMonthInput: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  requestedCoverStartDateYearInput: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  coverEndDateDayInput: () => cy.get('[data-cy="coverEndDate-day"]'),
  coverEndDateMonthInput: () => cy.get('[data-cy="coverEndDate-month"]'),
  coverEndDateYearInput: () => cy.get('[data-cy="coverEndDate-year"]'),
  uniqueIdentificationNumberInput: () => cy.get('[data-cy="unique-identification-number"]'),
  bondBeneficiaryInput: () => cy.get('[data-cy="bond-beneficiary"]'),
  submit: () => cy.get('button'),
};

module.exports = page;
