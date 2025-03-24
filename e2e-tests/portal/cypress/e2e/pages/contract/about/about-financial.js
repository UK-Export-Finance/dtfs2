const date = (prefix) => ({
  day: () => cy.get(`[data-cy="${prefix}-day"]`),
  month: () => cy.get(`[data-cy="${prefix}-month"]`),
  year: () => cy.get(`[data-cy="${prefix}-year"]`),
});

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/financial`),

  title: () => cy.get('[data-cy="about"]'),

  supplyContractValue: () => cy.get('[data-cy="supplyContractValue"]'),
  supplyContractCurrency: () => cy.get('[data-cy="supplyContractCurrency"]'),
  supplyContractConversionRateToGBP: () => cy.get('[data-cy="supplyContractConversionRateToGBP"]'),
  supplyContractConversionDate: () => date('supplyContractConversionDate'),

  preview: () => cy.get('[data-cy="Preview"]'),
  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
