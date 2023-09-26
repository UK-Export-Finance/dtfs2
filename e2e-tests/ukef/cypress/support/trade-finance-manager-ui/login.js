const tfmPages = require('../../../../trade-finance-manager/cypress/e2e/pages');

module.exports = (opts) => {
  const { username, password } = opts;
  tfmPages.landingPage.email().type(username);
  tfmPages.landingPage.password().type(password);
  tfmPages.landingPage.submitButton().click();
};
