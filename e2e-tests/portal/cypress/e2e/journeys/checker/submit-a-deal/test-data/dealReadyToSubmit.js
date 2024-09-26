const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const { oneMonth, today } = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate()));

  deal.details.submissionCount = 0;

  deal.submissionDetails['supplyContractConversionDate-day'] = today.day;
  deal.submissionDetails['supplyContractConversionDate-month'] = today.month;
  deal.submissionDetails['supplyContractConversionDate-year'] = today.year;

  deal.loanTransactions.items[0].requestedCoverStartDate = today.unixMilliseconds;

  deal.loanTransactions.items[0]['coverEndDate-day'] = oneMonth.day;
  deal.loanTransactions.items[0]['coverEndDate-month'] = oneMonth.month;
  deal.loanTransactions.items[0]['coverEndDate-year'] = oneMonth.year;
  return deal;
};
