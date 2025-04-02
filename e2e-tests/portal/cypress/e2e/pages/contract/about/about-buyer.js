const address = require('./address');

const page = {
  visit: (dealId) => cy.visit(`/contract/${dealId}/about/buyer`),

  title: () => cy.get('[data-cy="about"]'),

  buyerName: () => cy.get('[data-cy="buyer-name"]'),
  buyerAddress: () => address('buyer-address'),
  destinationOfGoodsAndServices: () => cy.get('[data-cy="destinationOfGoodsAndServices"]'),

  nextPage: () => cy.get('[data-cy="NextPage"]'),
  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
