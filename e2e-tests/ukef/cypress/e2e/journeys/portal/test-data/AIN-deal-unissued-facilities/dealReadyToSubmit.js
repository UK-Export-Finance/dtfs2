const dealThatJustNeedsDates = require('./dealThatJustNeedsDates.json');
const { today } = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const nowDay = today.dayLong;
  const nowMonth = today.monthLong;
  const nowYear = today.year;

  const deal = { ...dealThatJustNeedsDates };

  deal.submissionDetails['supplyContractConversionDate-day'] = nowDay;
  deal.submissionDetails['supplyContractConversionDate-month'] = nowMonth;
  deal.submissionDetails['supplyContractConversionDate-year'] = nowYear;

  deal.mockFacilities[0]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[0]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[0]['conversionRateDate-year'] = nowYear;

  deal.mockFacilities[1]['conversionRateDate-day'] = nowDay;
  deal.mockFacilities[1]['conversionRateDate-month'] = nowMonth;
  deal.mockFacilities[1]['conversionRateDate-year'] = nowYear;

  return deal;
};
