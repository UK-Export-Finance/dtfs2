const { getDealEffectiveDate, getDealCurrency } = require('./helpers');
const CONSTANTS = require('../../constants');

/*
"effectiveDate"   date    As per deal Commencement date
"currency"        string  Deal Currency,
"expiryDate"      date    2050-12-31 (default)
*/

const dealInvestor = (deal) => ({
  effectiveDate: getDealEffectiveDate(deal),
  currency: getDealCurrency(deal),
  expiryDate: CONSTANTS.DEAL.EXPIRATION_DATE.NONE,
});

module.exports = dealInvestor;
