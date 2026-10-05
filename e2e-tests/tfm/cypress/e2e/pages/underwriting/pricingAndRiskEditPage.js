const pricingAndRiskEditPage = {
  creditRatingRadioInputValidationError: () => cy.get('[data-cy="credit-rating-input-validation-error"]'),

  creditRatingRadioInputGood: () => cy.get('[data-cy="credit-rating-good"]'),
  creditRatingRadioInputAcceptable: () => cy.get('[data-cy="credit-rating-acceptable"]'),
  creditRatingOtherLabel: () => cy.get('[data-cy="exporterCreditRatingOther-label"]'),
  creditRatingRadioInputOther: () => cy.get('[data-cy="credit-rating-other"]'),
  creditRatingTextInputOther: () => cy.get('[data-cy="accessible-autocomplete-select-exporterCreditRatingOther"]'),
  creditRatingTextInputOtherValidationError: () => cy.get('[data-cy="exporterCreditRatingOther-error-message"]'),

  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = pricingAndRiskEditPage;
