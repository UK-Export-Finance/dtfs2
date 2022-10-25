const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate.json');

const now = new Date();

module.exports = {
  ...dealThatJustNeedsConversionDate,
  submissionDetails: {
    ...dealThatJustNeedsConversionDate.submissionDetails,
    'supplyContractConversionDate-day': now.getDate(),
    'supplyContractConversionDate-month': now.getMonth() + 1,
    'supplyContractConversionDate-year': now.getFullYear(),
  },
};
