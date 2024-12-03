const partial = {
  allDealsLink: () => cy.get('[data-cy="all-deals-nav-link"]'),
  allFacilitiesLink: () => cy.get('[data-cy="all-facilities-nav-link"]'),
  bankReportsLink: () => cy.get('[data-cy="bank-reports-nav-link"]'),
};

module.exports = partial;
