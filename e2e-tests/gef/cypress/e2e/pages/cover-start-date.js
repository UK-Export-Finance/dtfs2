const coverStartDate = {

  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
  updateIndividualCoverStartDateButton: (id) => cy.get((`[data-cy="update-coverStartDate-button-${id}"]`)),
  coverStartDateScreen: () => cy.get('[data-cy="ukefCoverStartDate-confirm"]'),
  coverStartDateYes: () => cy.get('[data-cy="ukef-cover-start-date-true"]'),
  coverStartDateNo: () => cy.get('[data-cy="ukef-cover-start-date-false"]'),

  coverStartDateDay: () => cy.get('[data-cy="ukef-cover-start-date-day"]'),
  coverStartDateMonth: () => cy.get('[data-cy="ukef-cover-start-date-month"]'),
  coverStartDateYear: () => cy.get('[data-cy="ukef-cover-start-date-year"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  errorInput: () => cy.get('[data-cy="ukefCoverStartDateInput-error"]'),

  coverStartDateSuccess: () => cy.get('[data-cy="confirm-cover-start-success"]'),

  continueButton: () => cy.get('[data-cy="continue-button"]'),

};

export default coverStartDate;
