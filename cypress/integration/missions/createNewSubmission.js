const appUnderTest = require('../appUnderTest');
const pages = require('../pages');

module.exports = () => {
  const startNowPage = pages.startNow;

  startNowPage.createNewSubmission().click();
}
