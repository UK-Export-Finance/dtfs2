const { to2Decimals } = require('../../helpers/currency');
const { getDealValue, getDealEffectiveDate, getDealGuaranteeExpiryDate } = require('./helpers');

/*
  "dealIdentifier":       Deal ACBS ID
  "guarantorParty":       Use 00000141
  "limitKey":             Supplier or Indemnifier ACBS Party Identifier? Supplier/Exporter ACBS id
  "guaranteeExpiryDate":  Effective date plus 20 years
  "effectiveDate":        As per the Commencement dates for the Deal record
  "maximumLiability":     Contract Value
*/

const dealInvestor = (deal, limitKey) => {
  return {
    dealIdentifier: deal.dealSnapshot.ukefDealId.padStart(10, 0),
    guarantorParty: '00000141',
    limitKey,
    guaranteeExpiryDate: getDealGuaranteeExpiryDate(deal),
    effectiveDate: getDealEffectiveDate(deal),
    maximumLiability: to2Decimals(getDealValue(deal)),
  };
};

module.exports = dealInvestor;
