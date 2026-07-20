const pricingAndRiskEditPage = {
  creditRatingRadioInputValidationError: () => cy.get('[data-cy="credit-rating-input-validation-error"]'),

  creditRatingRadioInputGood: () => cy.get('[data-cy="credit-rating-good"]'),
  creditRatingRadioInputAcceptable: () => cy.get('[data-cy="credit-rating-acceptable"]'),
  creditRatingRadioInputOther: () => cy.get('[data-cy="credit-rating-other"]'),
  creditRatingTextInputOther: () => cy.get('[data-cy="accessible-autocomplete-select-exporterCreditRatingOther"]'),
  creditRatingTextInputOtherValidationError: () => cy.get('[data-cy="exporterCreditRatingOther-error-message"]'),
  creditRatingTextInputOption: (option) =>
    cy
      .get('[id^="exporterCreditRatingOther__option--"]')
      .filter((_, el) => el.innerText.trim() === option)
      .first(),

  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = pricingAndRiskEditPage;
