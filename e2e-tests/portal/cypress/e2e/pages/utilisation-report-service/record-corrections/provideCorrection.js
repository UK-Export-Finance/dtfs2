const page = {
  facilityIdInput: () => cy.get('input[data-cy="FACILITY_ID_INCORRECT-input"]'),
  reportedCurrency: {
    container: () => cy.get('[data-cy="REPORTED_CURRENCY_INCORRECT-input"]'),
    radioInput: (currency) => cy.get(`input[data-cy="currency-${currency}"]`),
  },
  reportedFeeInput: () => cy.get('input[data-cy="REPORTED_FEE_INCORRECT-input"]'),
  utilisationInput: () => cy.get('input[data-cy="UTILISATION_INCORRECT-input"]'),
  additionalComments: {
    input: () => cy.get(`textarea[data-cy="additional-comments-input"]`),
    label: () => cy.get(`[data-cy="additional-comments-label"]`),
    hint: () => cy.get(`[data-cy="additional-comments-hint"]`),
  },
};

module.exports = page;
