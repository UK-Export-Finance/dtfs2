const page = {
  facilityIdInput: () => cy.get('input[data-cy="FACILITY_ID_INCORRECT-input"]'),
  facilityIdError: () => cy.get('[data-cy="FACILITY_ID_INCORRECT-error"]'),
  reportedCurrency: {
    container: () => cy.get('[data-cy="REPORTED_CURRENCY_INCORRECT-input"]'),
    radioInput: (currency) => cy.get(`input[data-cy="currency-${currency}"]`),
    error: () => cy.get('[data-cy="REPORTED_CURRENCY_INCORRECT-error"]'),
  },
  reportedFeeInput: () => cy.get('input[data-cy="REPORTED_FEE_INCORRECT-input"]'),
  reportedFeeError: () => cy.get('[data-cy="REPORTED_FEE_INCORRECT-error"]'),
  utilisationInput: () => cy.get('input[data-cy="UTILISATION_INCORRECT-input"]'),
  utilisationError: () => cy.get('[data-cy="UTILISATION_INCORRECT-error"]'),
  additionalComments: {
    input: () => cy.get(`textarea[data-cy="additional-comments-input"]`),
    label: () => cy.get(`[data-cy="additional-comments-label"]`),
    hint: () => cy.get(`[data-cy="additional-comments-hint"]`),
    error: () => cy.get('[data-cy="additional-comments-error"]'),
  },
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  errorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),
};

module.exports = page;
