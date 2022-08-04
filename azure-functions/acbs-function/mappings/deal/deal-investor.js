const {
  getDealEffectiveDate,
  getDealValue,
  getDealId,
  getDealCurrency,
} = require('./helpers');
const CONSTANTS = require('../../constants');

/*
"dealIdentifier":     Deal ACBS ID
"effectiveDate":      As per deal Commencement date
"currency":           Deal Currency,
"maximumLiability":   Contract Value,
"expiryDate":     2050-12-31
*/

const dealInvestor = (deal) => ({
  dealIdentifier: getDealId(deal),
  expiryDate: CONSTANTS.DEAL.EXPIRATION_DATE.NONE,
  effectiveDate: getDealEffectiveDate(deal),
  currency: getDealCurrency(deal),
  maximumLiability: getDealValue(deal),
});

module.exports = dealInvestor;
