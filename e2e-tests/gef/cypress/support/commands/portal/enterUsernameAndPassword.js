const landingPage = require('../../../e2e/pages/landingPage');

module.exports = ({ username, password }) => {
  landingPage.visit();
  landingPage.email().type(username);
  landingPage.password().type(password);
  landingPage.login().click();
};
