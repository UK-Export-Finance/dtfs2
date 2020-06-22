const moment = require('moment');
const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');

module.exports = () => {
  const now = moment();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate()));

  deal.submissionDetails["supplyContractConversionDate-day"] = `${now.format('DD')}`;
  deal.submissionDetails["supplyContractConversionDate-month"] = `${now.format('MM')}`;
  deal.submissionDetails["supplyContractConversionDate-year"] = `${now.format('YYYY')}`;

  deal.loanTransactions.items[0]['requestedCoverStartDate-day'] = now.format('DD');
  deal.loanTransactions.items[0]['requestedCoverStartDate-month'] = now.format('MM');
  deal.loanTransactions.items[0]['requestedCoverStartDate-year'] = now.format('YYYY');

  const aMonthInTheFuture = moment().add(1, 'month');
  deal.loanTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture.format('DD');
  deal.loanTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture.format('MM');
  deal.loanTransactions.items[0]['coverEndDate-year'] = moment(aMonthInTheFuture).format('YYYY');
  deal.loanTransactions.items[0].facilityStage = 'Unconditional';

  return deal;
}
