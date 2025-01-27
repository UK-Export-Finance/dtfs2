const bankReviewDate = {
  bankReviewDateDay: () => cy.get('[data-cy="bank-review-date-day"]'),
  bankReviewDateMonth: () => cy.get('[data-cy="bank-review-date-month"]'),
  bankReviewDateYear: () => cy.get('[data-cy="bank-review-date-year"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  bankReviewDateInlineError: () => cy.get('[data-cy="bank-review-date-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = bankReviewDate;
