const { oneMonth, today, tomorrow } = require('@ukef/dtfs2-common/test-helpers');
const dealThatJustNeedsDates = require('./dealThatJustNeedsDates.json');

module.exports = () => {
  const nowDay = today.dayLong;
  const nowMonth = today.monthLong;
  const nowYear = today.year;
  const nowPlusMonthDay = oneMonth.dayLong;
  const nowPlusMonthMonth = oneMonth.monthLong;
  const nowPlusMonthYear = oneMonth.year;

  const deal = { ...dealThatJustNeedsDates };

  deal.submissionDetails['supplyContractConversionDate-day'] = nowDay;
  deal.submissionDetails['supplyContractConversionDate-month'] = nowMonth;
  deal.submissionDetails['supplyContractConversionDate-year'] = nowYear;

  deal.mockFacilities[0].requestedCoverStartDate = tomorrow.date.valueOf();
  deal.mockFacilities[1].requestedCoverStartDate = tomorrow.date.valueOf();
  deal.mockFacilities[2].requestedCoverStartDate = tomorrow.date.valueOf();
  deal.mockFacilities[3].requestedCoverStartDate = tomorrow.date.valueOf();
  deal.mockFacilities[4].requestedCoverStartDate = tomorrow.date.valueOf();
  deal.mockFacilities[5].requestedCoverStartDate = tomorrow.date.valueOf();

  deal.mockFacilities[0]['requestedCoverStartDate-day'] = tomorrow.dayLong;
  deal.mockFacilities[0]['requestedCoverStartDate-month'] = tomorrow.monthLong;
  deal.mockFacilities[0]['requestedCoverStartDate-year'] = tomorrow.year;

  deal.mockFacilities[1]['requestedCoverStartDate-day'] = tomorrow.dayLong;
  deal.mockFacilities[1]['requestedCoverStartDate-month'] = tomorrow.monthLong;
  deal.mockFacilities[1]['requestedCoverStartDate-year'] = tomorrow.year;

  deal.mockFacilities[2]['requestedCoverStartDate-day'] = tomorrow.dayLong;
  deal.mockFacilities[2]['requestedCoverStartDate-month'] = tomorrow.monthLong;
  deal.mockFacilities[2]['requestedCoverStartDate-year'] = tomorrow.year;

  deal.mockFacilities[3]['requestedCoverStartDate-day'] = tomorrow.dayLong;
  deal.mockFacilities[3]['requestedCoverStartDate-month'] = tomorrow.monthLong;
  deal.mockFacilities[3]['requestedCoverStartDate-year'] = tomorrow.year;

  deal.mockFacilities[4]['requestedCoverStartDate-day'] = tomorrow.dayLong;
  deal.mockFacilities[4]['requestedCoverStartDate-month'] = tomorrow.monthLong;
  deal.mockFacilities[4]['requestedCoverStartDate-year'] = tomorrow.year;

  deal.mockFacilities[5]['requestedCoverStartDate-day'] = tomorrow.dayLong;
  deal.mockFacilities[5]['requestedCoverStartDate-month'] = tomorrow.monthLong;
  deal.mockFacilities[5]['requestedCoverStartDate-year'] = tomorrow.year;

  deal.mockFacilities[0]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[0]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[0]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[1]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[1]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[1]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[2]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[2]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[2]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[3]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[3]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[3]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[4]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[4]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[4]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[5]['coverEndDate-day'] = nowPlusMonthDay;
  deal.mockFacilities[5]['coverEndDate-month'] = nowPlusMonthMonth;
  deal.mockFacilities[5]['coverEndDate-year'] = nowPlusMonthYear;

  deal.mockFacilities[0]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[0]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[0]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[1]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[1]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[1]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[2]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[2]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[2]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[3]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[3]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[3]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[4]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[4]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[4]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[5]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[5]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[5]['conversionRateDate-year'] = nowYear;

  return deal;
};
