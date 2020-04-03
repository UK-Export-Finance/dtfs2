const page = {
  visit: () => cy.visit('/unable-to-proceed'),
  goToHomepage: () => cy.contains('Go to homepage'),
}

module.exports = page;
