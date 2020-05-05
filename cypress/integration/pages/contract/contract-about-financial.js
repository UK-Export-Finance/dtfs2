const address = require('./address');
const nav = require('./about-supply-contract-nav');

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/financial`),
  nav: () => nav,

  supplyContractValue: () => cy.get('[data-cy="supplyContractValue"]'),
  supplyContractCurrency: () => cy.get('[data-cy="supplyContractCurrency"]'),
  conversionRateToGBP: () => cy.get('[data-cy="conversionRateToGBP"]'),

  preview: () => cy.get('[data-cy="Preview"]'),
  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
