const nav = require('./nav');

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/buyer`),
  nav: () => nav,

  buyerName: () => cy.get('[data-cy="buyer-name"]'),
  countryOfBuyer: () => cy.get('[data-cy="countryOfBuyer"]'),
  destinationOfGoodsAndServices: () => cy.get('[data-cy="destinationOfGoodsAndServices"]'),

  nextPage: () => cy.get('[data-cy="NextPage"]'),
  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
