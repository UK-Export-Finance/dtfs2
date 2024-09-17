const page = {
  issuedDateDayInput: () => cy.get('[data-cy="issuedDate-day"]'),
  issuedDateMonthInput: () => cy.get('[data-cy="issuedDate-month"]'),
  issuedDateYearInput: () => cy.get('[data-cy="issuedDate-year"]'),

  requestedCoverStartDateDayInput: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  requestedCoverStartDateMonthInput: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  requestedCoverStartDateYearInput: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  requestedCoverStartDateError: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),

  coverEndDateDayInput: () => cy.get('[data-cy="coverEndDate-day"]'),
  coverEndDateMonthInput: () => cy.get('[data-cy="coverEndDate-month"]'),
  coverEndDateYearInput: () => cy.get('[data-cy="coverEndDate-year"]'),
  coverEndDateError: () => cy.get('[data-cy="coverEndDate-error-message"]'),

  name: () => cy.get('[data-cy="name"]'),
};

module.exports = page;
