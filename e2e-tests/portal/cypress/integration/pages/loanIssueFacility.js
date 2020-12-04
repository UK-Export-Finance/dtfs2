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

  disbursementAmount: () => cy.get('[data-cy="disbursement-amount"]'),
  bankReferenceNumber: () => cy.get('[data-cy="bankReferenceNumber"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
};

module.exports = page;
