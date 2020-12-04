const page = {
  issuedDateDayInput: () => cy.get('[data-cy="issuedDate-day"]'),
  issuedDateMonthInput: () => cy.get('[data-cy="issuedDate-month"]'),
  issuedDateYearInput: () => cy.get('[data-cy="issuedDate-year"]'),

  requestedCoverStartDateDayInput: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  requestedCoverStartDateMonthInput: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  requestedCoverStartDateYearInput: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),

  coverEndDateDayInput: () => cy.get('[data-cy="coverEndDate-day"]'),
  coverEndDateMonthInput: () => cy.get('[data-cy="coverEndDate-month"]'),
  coverEndDateYearInput: () => cy.get('[data-cy="coverEndDate-year"]'),

  uniqueIdentificationNumber: () => cy.get('[data-cy="unique-identification-number"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
};

module.exports = page;
