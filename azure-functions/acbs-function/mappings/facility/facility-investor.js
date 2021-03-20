/*
  "facilityIdentifier",
  "guaranteeCommencementDate",
  "guaranteeExpiryDate",
  "effectiveDate",
  "currency",
  "maximumLiability"
  */

const helpers = require('./helpers');
const { formatTimestamp } = require('../../helpers/date');

const facilityInvestor = (deal, facility) => {
  const { details } = deal.dealSnapshot;
  const { facilitySnapshot } = facility;

  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = helpers.getGuaranteeDates(facility, details.submissionDate);


  return {
    facilityIdentifier: facilitySnapshot.ukefFacilityID.padStart(10, 0),
    portfolioIdentifier: 'E1',
    maximumLiability: Number(facilitySnapshot.facilityValue),
    currency: facilitySnapshot.currency.id,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate: formatTimestamp(effectiveDate),
  };
};

module.exports = facilityInvestor;
