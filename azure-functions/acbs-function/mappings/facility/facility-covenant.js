/*
  "facilityIdentifier",
  "portfolioIdentifier",
  "covenantIdentifier",
  "covenantType",
  "maximumLiability",
  "currency",
  "guaranteeCommencementDate",
  "guaranteeExpiryDate",
  "effectiveDate"
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

const facilityCovenant = (deal, facility, covenantType) => {
  const { guaranteeCommencementDate, guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;
  const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

  return {
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    covenantType,
    maximumLiability: helpers.getMaximumLiability(facility, true),
    currency,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityCovenant;
