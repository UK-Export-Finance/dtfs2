/*
  "maximumLiability"      Maximum facility UKEF exposure
  "currency"              Facility currency
  "guaranteeExpiryDate"   Facility cover end date
  "effectiveDate"         Facility effective from date
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

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
