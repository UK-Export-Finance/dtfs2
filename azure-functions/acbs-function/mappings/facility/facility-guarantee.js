/*
  "guarantorParty"        ACBS Party Identifier based on the type for party (Exporter, Agent, Indemnifier, Buyer, Bank)
  "limitKey"              ACBS Party Identifier
  "guaranteeExpiryDate"   Facility cover end date
  "effectiveDate"         Facility effective from date
  "maximumLiability"      Facility maximum UKEF exposure
  "guaranteeTypeCode"     Guarantee type code (CONSTANTS.FACILITY.GUARANTEE_TYPE)
  */

const helpers = require('./helpers');

/**
 * Maps the facility guarantee record for a given deal and facility.
 *
 * This function performs the following operations:
 * 1. Extracts the guarantee expiry date and effective date from the facility's guarantee dates.
 * 2. Retrieves the guarantor party identifier based on the ACBS data and guarantee type code.
 * 3. Retrieves the limit key from the ACBS data.
 * 4. Calculates the maximum liability using a helper function.
 * 5. Constructs and returns the facility guarantee record object.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} facility - The facility object containing facility details.
 * @param {Object} acbsData - The ACBS data containing party identifiers and other details.
 * @param {string} guaranteeTypeCode - The guarantee type code.
 * @returns {Object} - The mapped facility guarantee record, including guarantor party, limit key, guarantee expiry date, effective date, maximum liability, and guarantee type code.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the mapping process.
 */
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
