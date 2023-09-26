const partial = {
  allDealsLink: () => cy.get('[data-cy="all-deals-link"]'),
  allFacilitiesLink: () => cy.get('[data-cy="all-facilities-link"]'),
};

module.exports = partial;
