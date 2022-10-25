const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/submission-details`),

  header: () => cy.get('[data-cy="heading"]'),
};

module.exports = page;
