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
