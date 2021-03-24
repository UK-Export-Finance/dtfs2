const pricingAndRiskEditPage = {
  // addRatingLink: () => cy.get('[data-cy="add-credit-rating-link"]'),
  creditRatingRadioInputGood: () => cy.get('[data-cy="credit-rating-good"]'),
  creditRatingRadioInputAcceptable: () => cy.get('[data-cy="credit-rating-acceptable"]'),
  creditRatingRadioInputOther: () => cy.get('[data-cy="credit-rating-other"]'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = pricingAndRiskEditPage;
