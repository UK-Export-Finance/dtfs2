const moment = require('moment');
const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');

module.exports = () => {
  const now = moment();

  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate));

  deal.submissionDetails['supplyContractConversionDate-day'] = `${now.format('DD')}`;
  deal.submissionDetails['supplyContractConversionDate-month'] = `${now.format('MM')}`;
  deal.submissionDetails['supplyContractConversionDate-year'] = `${now.format('YYYY')}`;

  return deal;
};
