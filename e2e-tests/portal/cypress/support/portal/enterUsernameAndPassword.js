const pages = require('../../e2e/pages');

module.exports = ({ username, password }) => {
  pages.landingPage.visit();
  cy.keyboardInput(pages.landingPage.email(), username);
  cy.keyboardInput(pages.landingPage.password(), password);
  pages.landingPage.login().click();
};
