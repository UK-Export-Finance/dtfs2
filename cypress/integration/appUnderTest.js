const {landingPage} = require('./pages');

module.exports = {
  start: () => {
    cy.visit('http://localhost:5000/');
    return landingPage;
  }
}
