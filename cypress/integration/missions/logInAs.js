const appUnderTest = require('../appUnderTest');
const pages = require('../pages');

module.exports = (username, password) => {
  // visit the homepage
  const landingPage = appUnderTest.start();

  // log in
  landingPage.email().type(username);
  landingPage.password().type(password);
  landingPage.login().click();
}
