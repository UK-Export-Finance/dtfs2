const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');

const { today, oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const now = new Date();

  const nowDay = today.dayLong;
  const nowMonth = today.monthLong;
  const nowYear = today.year;
  const nowPlusMonthDay = oneMonth.dayLong;
  const nowPlusMonthMonth = oneMonth.monthLong;
  const nowPlusMonthYear = oneMonth.year;

  const deal = { ...dealThatJustNeedsConversionDate() };

  deal.submissionDetails['supplyContractConversionDate-day'] = nowDay;
  deal.submissionDetails['supplyContractConversionDate-month'] = nowMonth;
  deal.submissionDetails['supplyContractConversionDate-year'] = nowYear;

  const loan = deal.mockFacilities.find((f) => f.type === 'Loan');
  loan.requestedCoverStartDate = now.valueOf();

  loan['coverEndDate-day'] = nowPlusMonthDay;
  loan['coverEndDate-month'] = nowPlusMonthMonth;
  loan['coverEndDate-year'] = nowPlusMonthYear;
  return deal;
};
