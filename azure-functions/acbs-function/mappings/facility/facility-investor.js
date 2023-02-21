/*
  "facilityIdentifier",
  "guaranteeCommencementDate",
  "guaranteeExpiryDate",
  "effectiveDate",
  "currency",
  "maximumLiability"
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

const facilityInvestor = (deal, facility) => {
  const { guaranteeCommencementDate, guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;
  const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

  return {
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    maximumLiability: helpers.getMaximumLiability(facility),
    currency,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityInvestor;
