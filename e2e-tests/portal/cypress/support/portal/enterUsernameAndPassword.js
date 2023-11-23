const pages = require('../../e2e/pages');

module.exports = ({ username, password }) => {
  pages.landingPage.visit();
  pages.landingPage.email().type(username);
  pages.landingPage.password().type(password);
  pages.landingPage.login().click();
};
