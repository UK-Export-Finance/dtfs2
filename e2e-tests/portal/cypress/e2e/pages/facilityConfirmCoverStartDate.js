const page = {
  needToChangeCoverStartDateYes: () => cy.get('[data-cy="need-to-change-cover-start-date-yes"]'),
  needToChangeCoverStartDateNo: () => cy.get('[data-cy="need-to-change-cover-start-date-no"]'),
  coverStartDateDay: () => cy.get('[data-cy="requestedCoverStartDate-day"]'),
  coverStartDateMonth: () => cy.get('[data-cy="requestedCoverStartDate-month"]'),
  coverStartDateYear: () => cy.get('[data-cy="requestedCoverStartDate-year"]'),
  coverStarDateErrorMessage: () => cy.get('[data-cy="requestedCoverStartDate-error-message"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
};

module.exports = page;
