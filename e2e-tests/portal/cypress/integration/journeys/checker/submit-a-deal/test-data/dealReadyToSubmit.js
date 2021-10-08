const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');

module.exports = () => {
  const now = new Date();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate()));

  deal.details.submissionCount = 0;

  deal.submissionDetails['supplyContractConversionDate-day'] = `${now.getDate()}`;
  deal.submissionDetails['supplyContractConversionDate-month'] = `${now.getMonth() + 1}`;
  deal.submissionDetails['supplyContractConversionDate-year'] = `${now.getFullYear()}`;

  deal.loanTransactions.items[0].requestedCoverStartDate = now.valueOf();

  const aMonthInTheFuture = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  };
  deal.loanTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture().getDate();
  deal.loanTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture().getMonth() + 1;
  deal.loanTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture().getFullYear();
  return deal;
};
