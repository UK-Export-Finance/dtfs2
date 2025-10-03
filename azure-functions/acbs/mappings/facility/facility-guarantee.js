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
  try {
    const { guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;

    return {
      guarantorParty: helpers.getGuarantorParty(acbsData, guaranteeTypeCode),
      limitKey: acbsData.dealAcbsData.parties.exporter.partyIdentifier,
      guaranteeExpiryDate,
      effectiveDate,
      maximumLiability: helpers.getMaximumLiability(facility),
      guaranteeTypeCode,
    };
  } catch (error) {
    console.error('Unable to map facility guarantee record. %o', error);
    return {};
  }
};

module.exports = facilityGuarantee;
