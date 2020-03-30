const { startNow, beforeYouStart, bankDetails } = require('../pages');
const login = require('./login');

module.exports = (opts) => {
  const {username, password, deals} = opts;

  login({username, password});

  for (const deal of deals) {

    startNow.visit();
    startNow.createNewSubmission().click();

    beforeYouStart.true().click();
    beforeYouStart.submit().click();

    bankDetails.bankDealId().type(deal.bankDealId);
    bankDetails.bankDealName().type(deal.bankDealName);
    bankDetails.create().click();

  }

}
