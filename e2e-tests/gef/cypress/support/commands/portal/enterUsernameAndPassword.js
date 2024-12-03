const landingPage = require('../../../e2e/pages/landingPage');

module.exports = ({ username, password }) => {
  landingPage.visit();

  cy.keyboardInput(landingPage.email(), username);
  cy.keyboardInput(landingPage.password(), password);

  landingPage.login().click();
};
