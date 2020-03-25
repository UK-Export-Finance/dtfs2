const appUnderTest = require('../appUnderTest');
const pages = require('../pages');

module.exports = () => {
  const startNowPage = pages.startNow;

  if (!startNowPage.confirm()) { //TODO - put this as an example of what we -could- do.. whether we -should- is another matter...
    cy.visit('http://localhost:5000/start-now');
  }

  startNowPage.createNewSubmission().click();

  return pages.beforeYouStart;
}
