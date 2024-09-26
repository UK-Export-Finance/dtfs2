const tfmPages = require('../../../../tfm/cypress/e2e/pages');

module.exports = (opts) => {
  const { username, password } = opts;

  cy.keyboardInput(tfmPages.landingPage.email(), username);
  cy.keyboardInput(tfmPages.landingPage.password(), password);

  cy.clickSubmitButton();
};
