const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const { today, oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const deal = { ...dealThatJustNeedsConversionDate() };

  deal.submissionDetails['supplyContractConversionDate-day'] = today.day;
  deal.submissionDetails['supplyContractConversionDate-month'] = today.month;
  deal.submissionDetails['supplyContractConversionDate-year'] = today.year;

  const loan = deal.mockFacilities.find((f) => f.type === 'Loan');
  loan.requestedCoverStartDate = today.unixMilliseconds;

  loan['coverEndDate-day'] = oneMonth.day;
  loan['coverEndDate-month'] = oneMonth.month;
  loan['coverEndDate-year'] = oneMonth.year;
  return deal;
};
