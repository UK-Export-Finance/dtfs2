const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');
const dealThatJustNeedsDates = require('./dealThatJustNeedsDates.json');

module.exports = () => {
  const now = new Date();

  const nowDay = (dateConstants.todayDay).toString();
  const nowMonth = (dateConstants.todayMonth).toString();
  const nowYear = (dateConstants.todayYear).toString();
  const nowPlusMonthDay = (dateConstants.oneMonthDay).toString();
  const nowPlusMonthMonth = (dateConstants.oneMonthMonth).toString();
  const nowPlusMonthYear = (dateConstants.oneMonthYear).toString();

  const deal = { ...dealThatJustNeedsDates };

  deal.submissionDetails['supplyContractConversionDate-day'] = nowDay;
  deal.submissionDetails['supplyContractConversionDate-month'] = nowMonth;
  deal.submissionDetails['supplyContractConversionDate-year'] = nowYear;

  deal.mockFacilities[0].requestedCoverStartDate = now.valueOf();
  deal.mockFacilities[1].requestedCoverStartDate = now.valueOf();

  deal.mockFacilities[0]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[0]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[0]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[1]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[1]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[1]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[0]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[0]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[0]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[1]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[1]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[1]['conversionRateDate-year'] = nowYear;

  return deal;
};
