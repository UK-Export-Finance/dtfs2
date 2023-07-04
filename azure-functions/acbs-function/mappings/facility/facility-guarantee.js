/*
  "guarantorParty"        ACBS Party Identifier based on the type for party (Exporter, Agent, Indemnifier, Buyer, Bank)
  "limitKey"              ACBS Party Identifier
  "guaranteeExpiryDate"   Facility cover end date
  "effectiveDate"         Facility effective from date
  "maximumLiability"      Facility maximum UKEF exposure
  "guaranteeTypeCode"     Guarantee type code (CONSTANTS.FACILITY.GUARANTEE_TYPE)
  */

const helpers = require('./helpers');

const facilityGuarantee = (deal, facility, acbsData, guaranteeTypeCode) => {
  const { guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;

  return {
    guarantorParty: helpers.getGuarantorParty(acbsData, guaranteeTypeCode),
    limitKey: acbsData.dealAcbsData.parties.exporter.partyIdentifier,
    guaranteeExpiryDate,
    effectiveDate,
    maximumLiability: helpers.getMaximumLiability(facility),
    guaranteeTypeCode,
  };
};

module.exports = facilityGuarantee;
