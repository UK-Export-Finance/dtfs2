const tfmPages = require('../../../../trade-finance-manager/cypress/integration/pages');

module.exports = (opts) => {
  const { username, password } = opts;
  tfmPages.landingPage.email().type(username);
  tfmPages.landingPage.password().type(password);
  tfmPages.landingPage.submitButton().click();
};
