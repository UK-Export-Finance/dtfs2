const facilityEndDate = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  facilityEndDateError: () => cy.get('[data-cy="facility-end-date-inline-error"]'),
  facilityEndDateDay: () => cy.get('[data-cy="facility-end-date-day"]'),
  facilityEndDateMonth: () => cy.get('[data-cy="facility-end-date-month"]'),
  facilityEndDateYear: () => cy.get('[data-cy="facility-end-date-year"]'),
  facilityEndDateDetails: () => cy.get('[data-cy="facility-end-date-details"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default facilityEndDate;
