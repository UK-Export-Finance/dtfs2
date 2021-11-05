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
  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';

  return {
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId
      ? facility.facilitySnapshot.ukefFacilityId.padStart(10, 0)
      : facility.facilitySnapshot.ukefFacilityID.padStart(10, 0),
    portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    covenantType,
    maximumLiability: helpers.getMaximumLiability(facility.facilitySnapshot),
    currency: facility.facilitySnapshot.currency.id
      ? facility.facilitySnapshot.currency.id
      : facility.facilitySnapshot.currency,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityCovenant;
