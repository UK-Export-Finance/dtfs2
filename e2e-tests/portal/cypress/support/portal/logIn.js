const pages = require('../../integration/pages');

module.exports = (opts) => {
  const { username, password } = opts;

  pages.landingPage.visit();
  pages.landingPage.email().type(username);
  pages.landingPage.password().type(password);
  pages.landingPage.login().click();
};
