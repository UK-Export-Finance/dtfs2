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
  const { facilitySnapshot } = facility;

  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates;


  return {
    facilityIdentifier: facilitySnapshot.ukefFacilityID.padStart(10, 0),
    portfolioIdentifier: 'E1',
    maximumLiability: helpers.getMaximumLiability(facility),
    currency: facilitySnapshot.currency.id,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = facilityInvestor;
