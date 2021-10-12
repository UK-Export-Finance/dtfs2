const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');

module.exports = () => {
  const now = new Date();

  const deal = { ...dealThatJustNeedsConversionDate };

  deal.submissionDetails['supplyContractConversionDate-day'] = now.getDate();
  deal.submissionDetails['supplyContractConversionDate-month'] = now.getMonth() + 1;
  deal.submissionDetails['supplyContractConversionDate-year'] = now.getFullYear();

  return deal;
};
