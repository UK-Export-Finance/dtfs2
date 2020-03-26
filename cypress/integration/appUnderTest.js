const {landingPage} = require('./pages');

module.exports = {
  start: () => {
    cy.visit('/');
    return landingPage;
  }
}
