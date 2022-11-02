const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const now = new Date();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate()));

  deal.details.submissionCount = 0;

  deal.submissionDetails['supplyContractConversionDate-day'] = dateConstants.todayDay;
  deal.submissionDetails['supplyContractConversionDate-month'] = dateConstants.todayMonth;
  deal.submissionDetails['supplyContractConversionDate-year'] = dateConstants.todayYear;

  deal.loanTransactions.items[0].requestedCoverStartDate = now.valueOf();

  deal.loanTransactions.items[0]['coverEndDate-day'] = (dateConstants.oneMonthDay).toString();
  deal.loanTransactions.items[0]['coverEndDate-month'] = (dateConstants.oneMonthMonth).toString();
  deal.loanTransactions.items[0]['coverEndDate-year'] = (dateConstants.oneMonthYear).toString();
  return deal;
};
