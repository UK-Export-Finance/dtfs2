module.exports = (prefix) => {
  return {
    line1: () => cy.get(`[data-cy="${prefix}-line-1"]`),
    line2: () => cy.get(`[data-cy="${prefix}-line-2"]`),
    town: () => cy.get(`[data-cy="${prefix}-town"]`),
    county: () => cy.get(`[data-cy="${prefix}-county"]`),
    postcode: () => cy.get(`[data-cy="${prefix}-postcode"]`),
    country: () => cy.get(`[data-cy="${prefix}-country"]`),
  }
};
