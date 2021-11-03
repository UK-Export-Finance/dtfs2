const page = {
  visit: () => cy.visit('/unable-to-proceed'),
  goToHomepage: () => cy.get('[data-cy="GoToHomepage"]'),
};

module.exports = page;
