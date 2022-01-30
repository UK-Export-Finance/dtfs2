const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const { nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

module.exports = () => {
  const now = new Date();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  // const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate()));
  const deal = { ...dealThatJustNeedsConversionDate };

  deal.details.submissionCount = 0;

  deal.submissionDetails['supplyContractConversionDate-day'] = now.getDate();
  deal.submissionDetails['supplyContractConversionDate-month'] = now.getMonth() + 1;
  deal.submissionDetails['supplyContractConversionDate-year'] = now.getFullYear();

  deal.loanTransactions.items[0].requestedCoverStartDate = now.valueOf();

  const aMonthInTheFuture = nowPlusMonths(1);
  deal.loanTransactions.items[0]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  deal.loanTransactions.items[0]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  deal.loanTransactions.items[0]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  return deal;
};
