const moment = require('moment');
const isIssued = require('../../helpers/is-issued');
const { stripCommas } = require('../../../utils/string');

const hasCoverEndDate = (day, month, year) => {
  if (day && month && year) {
    return true;
  }

  return false;
};

const mapCoverEndDate = (facility) => {
  const {
    'coverEndDate-day': day,
    'coverEndDate-month': month,
    'coverEndDate-year': year,
  } = facility;

  if (hasCoverEndDate(day, month, year)) {
    return moment().set({
      date: Number(day),
      month: Number(month) - 1, // months are zero indexed
      year: Number(year),
    });
  }

  return null;
};

const mapBssEwcsFacility = (facility) => {
  const {
    _id,
    ukefFacilityID,
    facilityType,
    facilityValue,
    currency,
    coveredPercentage,
    ukefExposure,
    ukefGuaranteeInMonths,
    hasBeenAcknowledged,
    requestedCoverStartDate,
    dayCountBasis,
    guaranteeFeePayableByBank,
    feeType,
    premiumType,
    feeFrequency,
    premiumFrequency,
    bankReferenceNumber,
    uniqueIdentificationNumber,
    disbursementAmount,
    facilityStage,
  } = facility;

  const cleanUkefExposure = Number(ukefExposure.split('.')[0].replace(/,/g, ''));

  return {
    _id,
    ukefFacilityID: Number(ukefFacilityID),
    facilityType,
    currencyCode: currency && currency.id,
    value: Number(facilityValue.replace(/,/g, '')),
    coverPercentage: Number(coveredPercentage),
    ukefExposure: cleanUkefExposure,
    coverStartDate: requestedCoverStartDate,
    ukefGuaranteeInMonths,
    hasBeenIssued: isIssued(facilityStage),
    hasBeenAcknowledged,
    coverEndDate: mapCoverEndDate(facility),
    guaranteeFee: Number(guaranteeFeePayableByBank),
    feeType: feeType || premiumType,
    feeFrequency: feeFrequency || premiumFrequency,
    dayCountBasis,
    disbursementAmount: disbursementAmount && Number(stripCommas(disbursementAmount)),
    bankReference: bankReferenceNumber,
    uniqueIdentificationNumber,
    tfm: facility.tfm,
  };
};

module.exports = {
  hasCoverEndDate,
  mapCoverEndDate,
  mapBssEwcsFacility,
};
