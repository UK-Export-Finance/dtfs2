const address = (prefix) => {
  return {
    line1: () => cy.get(`[data-cy="${prefix}"]`).get(`[data-cy="${prefix}-line-1"]`),
    line2: () => cy.get(`[data-cy="${prefix}"]`).get(`[data-cy="${prefix}-line-2"]`),
    town: () => cy.get(`[data-cy="${prefix}"]`).get(`[data-cy="${prefix}-town"]`),
    county: () => cy.get(`[data-cy="${prefix}"]`).get(`[data-cy="${prefix}-county"]`),
    postcode: () => cy.get(`[data-cy="${prefix}"]`).get(`[data-cy="${prefix}-postcode"]`),
    country: () => cy.get(`[data-cy="${prefix}"]`).get(`[data-cy="${prefix}-country"]`),
  }
};

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/supplier`),
  supplierType: () => cy.get('[data-cy="supplierType"]'),
  supplierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="supplierCompaniesHouseRegistrationNumber"]'),
  searchCompaniesHouse: () => cy.get('[data-cy="DoSearch-supplierCompaniesHouseRegistrationNumber"]'),
  supplierName: () => cy.get('[data-cy="supplierName"]'),
  supplierAddress: () => address('supplier-address'),
  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;
