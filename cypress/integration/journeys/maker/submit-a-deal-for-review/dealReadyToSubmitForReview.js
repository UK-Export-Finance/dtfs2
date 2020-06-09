const moment = require('moment');
const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate.json');

const now = moment();

module.exports ={
  ...dealThatJustNeedsConversionDate,
  submissionDetails: {
    ...dealThatJustNeedsConversionDate.submissionDetails,
    "supplyContractConversionDate-day" : `${now.format('DD')}`,
    "supplyContractConversionDate-month" : `${now.format('MM')}`,
    "supplyContractConversionDate-year" : `${now.format('YYYY')}`,
  }
};
