const moment = require('moment');
const isIssued = require('../../helpers/is-issued');

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
    bondType,
    facilityStage,
  } = facility;

  return {
    _id,
    ukefFacilityID,
    facilityType,
    currencyCode: currency && currency.id,
    value: Number(facilityValue.replace(/,/g, '')),
    coverPercentage: coveredPercentage,
    ukefExposure,
    coverStartDate: requestedCoverStartDate,
    ukefGuaranteeInMonths,
    hasBeenIssued: isIssued(facilityStage),
    hasBeenAcknowledged,
    coverEndDate: mapCoverEndDate(facility),
    guaranteeFeePayableByBank,
    dayCountBasis,
    feeFrequency,
    premiumFrequency,
    feeType,
    premiumType,
    bankReference: bankReferenceNumber,
    uniqueIdentificationNumber,
    bondType,
    tfm: facility.tfm,
  };
};


module.exports = {
  hasCoverEndDate,
  mapCoverEndDate,
  mapBssEwcsFacility,
};
