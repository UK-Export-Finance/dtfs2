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

const facilityCovenant = (deal, facility, covenantType) => {
  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates;

  return {
    facilityIdentifier: facility.ukefFacilityID !== undefined
      ? facility.ukefFacilityID.padStart(10, 0)
      : facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    portfolioIdentifier: 'E1',
    covenantType,
    maximumLiability: helpers.getMaximumLiability(facility.facilitySnapshot),
    currency: facility.facilitySnapshot.currency.id !== undefined
      ? facility.facilitySnapshot.currency.id
      : facility.facilitySnapshot.currency,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityCovenant;
