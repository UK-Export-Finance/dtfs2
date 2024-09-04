const bankReviewDate = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  bankReviewDateError: () => cy.get('[data-cy="bank-review-date-inline-error"]'),
  bankReviewDateDay: () => cy.get('[data-cy="bank-review-date-day"]'),
  bankReviewDateMonth: () => cy.get('[data-cy="bank-review-date-month"]'),
  bankReviewDateYear: () => cy.get('[data-cy="bank-review-date-year"]'),
  bankReviewDateDetails: () => cy.get('[data-cy="bank-review-date-details"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default bankReviewDate;
