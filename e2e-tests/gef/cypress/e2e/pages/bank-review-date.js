const bankReviewDate = {
  bankReviewDateError: () => cy.get('[data-cy="bank-review-date-inline-error"]'),
  bankReviewDateDay: () => cy.get('[data-cy="bank-review-date-day"]'),
  bankReviewDateMonth: () => cy.get('[data-cy="bank-review-date-month"]'),
  bankReviewDateYear: () => cy.get('[data-cy="bank-review-date-year"]'),
  bankReviewDateDetails: () => cy.get('[data-cy="bank-review-date-details"]'),
};

export default bankReviewDate;
