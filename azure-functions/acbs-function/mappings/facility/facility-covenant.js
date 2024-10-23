/*
  "covenantIdentifier"        UKEF covenant ID
  "covenantType"              Covenant type
  "maximumLiability"          UKEF maximum facility exposure
  "currency"                  Facility currency
  "guaranteeExpiryDate"       Facility cover end
  "effectiveDate"             Facility effective from date
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

/**
 * Maps the facility covenant record for a given deal and facility.
 *
 * This function performs the following operations:
 * 1. Extracts the guarantee expiry date and effective date from the facility's guarantee dates.
 * 2. Retrieves the currency of the facility, defaulting to a constant if not provided.
 * 3. Calculates the maximum liability using a helper function.
 * 4. Constructs and returns the facility covenant record object.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} facility - The facility object containing facility details.
 * @param {string} covenantType - The type of the covenant.
 * @returns {Object} - The mapped facility covenant record, including covenant type, maximum liability, currency, guarantee expiry date, and effective date.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the mapping process.
 */
const facilityCovenant = (deal, facility, covenantType) => {
  try {
    const { guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;
    const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

    return {
      covenantType,
      maximumLiability: helpers.getMaximumLiability(facility, true),
      currency,
      guaranteeExpiryDate,
      effectiveDate,
    };
  } catch (error) {
    console.error('Unable to map facility covenant record. %o', error);
    return {};
  }
};

module.exports = facilityCovenant;
