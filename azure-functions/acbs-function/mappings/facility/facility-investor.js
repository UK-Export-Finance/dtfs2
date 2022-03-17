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
  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';

  return {
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    maximumLiability: helpers.getMaximumLiability(facility),
    currency: facility.facilitySnapshot.currency.id,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityInvestor;
