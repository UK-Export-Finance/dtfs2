/*
  "facilityIdentifier",
  "guaranteeCommencementDate",
  "guaranteeExpiryDate",
  "effectiveDate",
  "currency",
  "maximumLiability"
  */

const helpers = require('./helpers');

const facilityInvestor = (deal, facility) => {
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
    maximumLiability: helpers.getMaximumLiability(facility.facilitySnapshot),
    currency: facility.facilitySnapshot.currency.id !== undefined
      ? facility.facilitySnapshot.currency.id
      : facility.facilitySnapshot.currency,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityInvestor;
