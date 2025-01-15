const whatDoYouNeedToChange = {
  coverEndDateCheckbox: () => cy.get('[data-cy="cover-end-date-checkbox"]'),
  facilityValueCheckbox: () => cy.get('[data-cy="facility-value-checkbox"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  selectionErrorMessage: () => cy.get('[data-cy="selection-error-message"]'),
};

module.exports = whatDoYouNeedToChange;
