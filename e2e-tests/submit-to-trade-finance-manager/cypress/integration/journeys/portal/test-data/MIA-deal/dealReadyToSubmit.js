const moment = require('moment');
const dealThatJustNeedsDates = require('./dealThatJustNeedsDates');

module.exports = () => {
  const now = moment();

  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsDates));

  deal.dealType = 'BSS/EWCS';
  deal.submissionDetails['supplyContractConversionDate-day'] = `${now.format('DD')}`;
  deal.submissionDetails['supplyContractConversionDate-month'] = `${now.format('MM')}`;
  deal.submissionDetails['supplyContractConversionDate-year'] = `${now.format('YYYY')}`;

  deal.mockFacilities[0].requestedCoverStartDate = moment().utc().valueOf();
  deal.mockFacilities[1].requestedCoverStartDate = moment().utc().valueOf();

  const aMonthInTheFuture = moment().add(1, 'month');

  deal.mockFacilities[0]['coverEndDate-day'] = aMonthInTheFuture.format('DD');
  deal.mockFacilities[0]['coverEndDate-month'] = aMonthInTheFuture.format('MM');
  deal.mockFacilities[0]['coverEndDate-year'] = moment(aMonthInTheFuture).format('YYYY');

  deal.mockFacilities[1]['coverEndDate-day'] = aMonthInTheFuture.format('DD');
  deal.mockFacilities[1]['coverEndDate-month'] = aMonthInTheFuture.format('MM');
  deal.mockFacilities[1]['coverEndDate-year'] = moment(aMonthInTheFuture).format('YYYY');

  return deal;
};
