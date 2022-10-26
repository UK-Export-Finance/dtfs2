const partial = {
  deals: () => cy.get('[data-cy="dashboard-sub-nav-link-deals"]'),
  facilities: () => cy.get('[data-cy="dashboard-sub-nav-link-facilities"]'),
};

module.exports = partial;
