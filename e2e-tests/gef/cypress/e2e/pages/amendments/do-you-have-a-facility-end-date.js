const doYouHaveAFacilityEndDate = {
  yesRadioButton: () => cy.get('[data-cy="is-using-facility-end-date-yes"]'),
  noRadioButton: () => cy.get('[data-cy="is-using-facility-end-date-no"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  inlineError: () => cy.get('[data-cy="is-using-facility-end-date-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = doYouHaveAFacilityEndDate;
