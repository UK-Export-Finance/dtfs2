/*
  "facilityIdentifier",
  "guaranteeCommencementDate",
  "guarantorParty": ACBS Party Identifier based on the type for investor,
          Bond Issuer, Bond Beneficiary, EWCS Facility Provider, EWCSBuyer Exporter,
  "limitKey": ACBS Party Identifier
  "guaranteeExpiryDate",
  "effectiveDate",
  "maximumLiability",
  "guaranteeTypeCode": BOND GIVER(315),BOND BENEFICIARY (310),FACILITY PROVIDER (500),BUYER FOR (EXPORTER EWCS) - 321
  */

const helpers = require('./helpers');
const { formatTimestamp } = require('../../helpers/date');

const facilityGuarantee = (deal, facility, acbsData, guaranteeTypeCode) => {
  const { details } = deal.dealSnapshot;
  const { facilitySnapshot } = facility;

  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = helpers.getGuaranteeDates(facility, details.submissionDate);


  return {
    facilityIdentifier: facilitySnapshot.ukefFacilityID.padStart(10, 0),
    guaranteeCommencementDate,
    guarantorParty: '00000141',
    limitKey: helpers.getFacilityGuaranteeLimitKey(acbsData, guaranteeTypeCode),
    guaranteeExpiryDate,
    effectiveDate: formatTimestamp(effectiveDate),
    maximumLiability: Number(facilitySnapshot.facilityValue),
    guaranteeTypeCode,
  };
};

module.exports = facilityGuarantee;
