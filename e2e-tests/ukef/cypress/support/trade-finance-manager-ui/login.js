const tfmPages = require('../../../../tfm/cypress/e2e/pages');

module.exports = (opts) => {
  const { username, password } = opts;
  tfmPages.landingPage.email().type(username);
  tfmPages.landingPage.password().type(password);
  cy.clickSubmitButton();
};
