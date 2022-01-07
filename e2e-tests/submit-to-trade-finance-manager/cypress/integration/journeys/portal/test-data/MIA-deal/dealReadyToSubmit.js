const { nowPlusMonths } = require('../../../../../support/utils/dateFuncs');
const dealThatJustNeedsDates = require('./dealThatJustNeedsDates.json');

module.exports = () => {
  const now = new Date();

  const deal = { ...dealThatJustNeedsDates };

  deal.submissionDetails['supplyContractConversionDate-day'] = now.getDate();
  deal.submissionDetails['supplyContractConversionDate-month'] = now.getMonth() + 1;
  deal.submissionDetails['supplyContractConversionDate-year'] = now.getFullYear();

  deal.mockFacilities[0].requestedCoverStartDate = now.valueOf();
  deal.mockFacilities[1].requestedCoverStartDate = now.valueOf();

  const aMonthInTheFuture = nowPlusMonths(1);

  deal.mockFacilities[0]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  deal.mockFacilities[0]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  deal.mockFacilities[0]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();

  deal.mockFacilities[1]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  deal.mockFacilities[1]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  deal.mockFacilities[1]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();

  return deal;
};
