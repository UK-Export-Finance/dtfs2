const { to2Decimals } = require('../../helpers/currency');
const { getDealEffectiveDate, getDealValue } = require('./helpers');
const CONSTANTS = require('../../constants');

const GEF_CURRENCY = 'GBP';

/*
"dealIdentifier":     Deal ACBS ID
"effectiveDate":      As per deal Commencement date
"currency":           Deal Currency,
"maximumLiability":   Contract Value,
"expirationDate":     99/99/99
*/

const dealInvestor = (deal) => ({
  dealIdentifier: deal.dealSnapshot.ukefDealId.padStart(10, 0),
  expirationDate: CONSTANTS.DEAL.EXPIRATION_DATE.NONE,
  effectiveDate: getDealEffectiveDate(deal),
  currency: deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF
    ? GEF_CURRENCY
    : deal.dealSnapshot.supplyContractCurrency && deal.dealSnapshot.supplyContractCurrency.id,
  maximumLiability: to2Decimals(getDealValue(deal)),
});

module.exports = dealInvestor;
