import { format } from 'date-fns';

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

  /**
   * Fill in the bank review date form
   * @param {Date} date
   */
  fillInBankReviewDate: (date) => {
    this.bankReviewDateDay().clear().type(format(date, 'd'));
    this.bankReviewDateMonth().clear().type(format(date, 'M'));
    this.bankReviewDateYear().clear().type(format(date, 'yyyy'));
  },
};

export default bankReviewDate;
