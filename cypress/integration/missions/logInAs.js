const appUnderTest = require('../appUnderTest');
const pages = require('../pages');

module.exports = (username, password) => {
  // visit the homepage
  const landingPage = appUnderTest.start();

  // log in
  landingPage.email().type(username);
  landingPage.password().type(password);
  landingPage.login().click();

  // check to see if login worked properly;
  // send us back the right page object based on success/failure.
  const startNow = pages.startNow;

  if (startNow.confirm()) {
    return startNow;
  } else {
    return '//TODO what page do we land on when we fail to login??'
  }

}
