const appUnderTest = require('../appUnderTest');

module.exports = (opts) => {
  const {username, password} = opts;

  // visit the homepage
  const landingPage = appUnderTest.start();

  // log in
  landingPage.email().type(username);
  landingPage.password().type(password);
  landingPage.login().click();
}
