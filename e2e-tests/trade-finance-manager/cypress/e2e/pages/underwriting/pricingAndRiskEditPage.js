const pricingAndRiskEditPage = {
  errorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),
  creditRatingRadioInputValidationError: () => cy.get('[data-cy="credit-rating-input-validation-error"]'),

  creditRatingRadioInputGood: () => cy.get('[data-cy="credit-rating-good"]'),
  creditRatingRadioInputAcceptable: () => cy.get('[data-cy="credit-rating-acceptable"]'),
  creditRatingRadioInputOther: () => cy.get('[data-cy="credit-rating-other"]'),
  creditRatingTextInputOther: () => cy.get('[data-cy="credit-rating-other-input"]'),
  creditRatingTextInputOtherValidationError: () => cy.get('[data-cy="credit-rating-other-input-validation-error"]'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = pricingAndRiskEditPage;
