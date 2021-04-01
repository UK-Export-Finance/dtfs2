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
const { formatTimestamp } = require('../../helpers/date');

const facilityCovenant = (deal, facility, covenantType) => {
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
    covenantType,
    maximumLiability: Number(facilitySnapshot.facilityValue),
    currency: facilitySnapshot.currency.currencyId,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate: formatTimestamp(effectiveDate),
  };
};

module.exports = facilityCovenant;
