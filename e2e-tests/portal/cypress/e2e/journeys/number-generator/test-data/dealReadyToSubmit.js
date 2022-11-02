const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const now = new Date();

  const nowDay = (dateConstants.todayDay).toString();
  const nowMonth = (dateConstants.todayMonth).toString();
  const nowYear = (dateConstants.todayYear).toString();
  const nowPlusMonthDay = (dateConstants.oneMonthDay).toString();
  const nowPlusMonthMonth = (dateConstants.oneMonthMonth).toString();
  const nowPlusMonthYear = (dateConstants.oneMonthYear).toString();

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
