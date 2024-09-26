const dealThatJustNeedsDates = require('./dealThatJustNeedsDates.json');
const { today, oneMonth } = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const deal = { ...dealThatJustNeedsDates };

  deal.submissionDetails['supplyContractConversionDate-day'] = today.day;
  deal.submissionDetails['supplyContractConversionDate-month'] = today.month;
  deal.submissionDetails['supplyContractConversionDate-year'] = today.year;

  deal.mockFacilities[0].requestedCoverStartDate = today.unixMilliseconds;
  deal.mockFacilities[1].requestedCoverStartDate = today.unixMilliseconds;

  deal.mockFacilities[0]['coverEndDate-day'] = oneMonth.day;
  deal.mockFacilities[0]['coverEndDate-month'] = oneMonth.month;
  deal.mockFacilities[0]['coverEndDate-year'] = oneMonth.year;

  deal.mockFacilities[1]['coverEndDate-day'] = oneMonth.day;
  deal.mockFacilities[1]['coverEndDate-month'] = oneMonth.month;
  deal.mockFacilities[1]['coverEndDate-year'] = oneMonth.year;

  deal.mockFacilities[0]['conversionRateDate-day'] = today.day;
  deal.mockFacilities[0]['conversionRateDate-month'] = today.month;
  deal.mockFacilities[0]['conversionRateDate-year'] = today.year;

  deal.mockFacilities[1]['conversionRateDate-day'] = today.day;
  deal.mockFacilities[1]['conversionRateDate-month'] = today.month;
  deal.mockFacilities[1]['conversionRateDate-year'] = today.year;

  return deal;
};
