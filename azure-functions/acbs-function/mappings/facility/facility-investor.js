/*
  "maximumLiability"      Maximum facility UKEF exposure
  "currency"              Facility currency
  "guaranteeExpiryDate"   Facility cover end date
  "effectiveDate"         Facility effective from date
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

/**
 * Maps the facility investor record for a given deal and facility.
 *
 * This function performs the following operations:
 * 1. Extracts the guarantee expiry date and effective date from the facility's guarantee dates.
 * 2. Retrieves the currency of the facility, defaulting to a constant if not provided.
 * 3. Calculates the maximum liability using a helper function.
 * 4. Constructs and returns the facility investor record object.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} facility - The facility object containing facility details.
 * @param {Object} facility.tfm - The TFM-specific details of the facility.
 * @param {Object} facility.tfm.facilityGuaranteeDates - The guarantee dates of the facility.
 * @param {Object} facility.facilitySnapshot - The snapshot of the facility details.
 * @param {Object} facility.facilitySnapshot.currency - The currency details of the facility.
 * @returns {Object} - The mapped facility investor record, including maximum liability, currency, guarantee expiry date, and effective date.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the mapping process.
 */
const facilityInvestor = (deal, facility) => {
  try {
    const { guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;
    const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

    return {
      maximumLiability: helpers.getMaximumLiability(facility),
      currency,
      guaranteeExpiryDate,
      effectiveDate,
    };
  } catch (error) {
    console.error('Unable to map facility investor record. %o', error);
    return {};
  }
};

module.exports = facilityInvestor;
