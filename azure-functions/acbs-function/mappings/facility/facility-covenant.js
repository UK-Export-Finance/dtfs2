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
  const { facilitySnapshot } = facility;

  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates;


  return {
    facilityIdentifier: facilitySnapshot.ukefFacilityID.padStart(10, 0),
    portfolioIdentifier: 'E1',
    covenantType,
    maximumLiability: helpers.getMaximumLiability(facility),
    currency: facilitySnapshot.currency.currencyId,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityCovenant;
