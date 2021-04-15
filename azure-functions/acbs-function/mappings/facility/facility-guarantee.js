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
    guarantorParty: helpers.getGuarantorParty(acbsData, guaranteeTypeCode),
    limitKey: acbsData.acbsData.parties.exporter.partyIdentifier,
    guaranteeExpiryDate,
    effectiveDate: formatTimestamp(effectiveDate),
    maximumLiability: helpers.getMaximumLiability(facility),
    guaranteeTypeCode,
  };
};

module.exports = facilityGuarantee;
