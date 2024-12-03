const { getDealGuaranteeValue, getDealEffectiveDate, getDealGuaranteeExpiryDate } = require('./helpers');
const CONSTANT = require('../../constants');

/*
  "effectiveDate"       date    As per the Commencement dates for the Deal record
  "limitKey"            string  Supplier or Indemnifier ACBS Party Identifier? Supplier/Exporter ACBS id
  "guaranteeExpiryDate" date    Effective date plus 20 years
  "maximumLiability"    float   Contract Value
  "guarantorParty"      string  00000141
*/

const dealInvestor = (deal, limitKey) => ({
  effectiveDate: getDealEffectiveDate(deal),
  limitKey,
  guaranteeExpiryDate: getDealGuaranteeExpiryDate(deal),
  maximumLiability: getDealGuaranteeValue(deal),
  guarantorParty: CONSTANT.DEAL.PARTY.GUARANTOR,
});

module.exports = dealInvestor;
