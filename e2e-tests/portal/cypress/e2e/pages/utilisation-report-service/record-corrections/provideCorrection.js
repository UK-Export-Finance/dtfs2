const page = {
  facilityIdInput: {
    container: () => cy.get('input[data-cy="FACILITY_ID_INCORRECT-input"]'),
    error: () => cy.get('[data-cy="FACILITY_ID_INCORRECT-error"]'),
  },
  reportedCurrency: {
    container: () => cy.get('[data-cy="REPORTED_CURRENCY_INCORRECT-input"]'),
    radioInput: (currency) => cy.get(`input[data-cy="currency-${currency}"]`),
    error: () => cy.get('[data-cy="REPORTED_CURRENCY_INCORRECT-error"]'),
  },
  reportedFeeInput: {
    container: () => cy.get('input[data-cy="REPORTED_FEE_INCORRECT-input"]'),
    error: () => cy.get('[data-cy="REPORTED_FEE_INCORRECT-error"]'),
  },
  utilisationInput: {
    container: () => cy.get('input[data-cy="UTILISATION_INCORRECT-input"]'),
    error: () => cy.get('[data-cy="UTILISATION_INCORRECT-error"]'),
  },
  additionalComments: {
    input: () => cy.get(`textarea[data-cy="additional-comments-input"]`),
    label: () => cy.get(`[data-cy="additional-comments-label"]`),
    hint: () => cy.get(`[data-cy="additional-comments-hint"]`),
    error: () => cy.get('[data-cy="additional-comments-error"]'),
  },
  errorSummary: {
    container: () => cy.get('[data-cy="error-summary"]'),
    items: () => cy.get('[data-cy="error-summary"] li'),
  },
};

module.exports = page;
