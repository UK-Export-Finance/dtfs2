const appUnderTest = require('../appUnderTest');
const pages = require('../pages');

module.exports = (opts) => {
  const {username, password} = opts;

  // visit the homepage
  const landingPage = appUnderTest.start();

  // log in
  landingPage.email().type(username);
  landingPage.password().type(password);
  landingPage.login().click();
}
