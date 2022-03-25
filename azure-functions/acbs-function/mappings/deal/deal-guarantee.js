const {
  getDealGuaranteeValue,
  getDealEffectiveDate,
  getDealGuaranteeExpiryDate,
  getDealId,
} = require('./helpers');
const CONSTANT = require('../../constants');

/*
  "dealIdentifier":       Deal ACBS ID
  "guarantorParty":       Use 00000141
  "limitKey":             Supplier or Indemnifier ACBS Party Identifier? Supplier/Exporter ACBS id
  "guaranteeExpiryDate":  Effective date plus 20 years
  "effectiveDate":        As per the Commencement dates for the Deal record
  "maximumLiability":     Contract Value
*/

const dealInvestor = (deal, limitKey) => ({
  dealIdentifier: getDealId(deal),
  guarantorParty: CONSTANT.DEAL.PARTY.GUARANTOR,
  limitKey,
  guaranteeExpiryDate: getDealGuaranteeExpiryDate(deal),
  effectiveDate: getDealEffectiveDate(deal),
  maximumLiability: getDealGuaranteeValue(deal),
});

module.exports = dealInvestor;
