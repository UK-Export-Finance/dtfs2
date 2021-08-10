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
    // TODO are these in gef facility?
    dayCountBasis,
    guaranteeFeePayableByBank,
    feeType,
    premiumType,
    feeFrequency,
    premiumFrequency,
  } = facility;

  return {
    _id,
    ukefFacilityID,
    facilityType,
    currency,
    value: Number(facilityValue.replace(/,/g, '')),
    coverPercentage: coveredPercentage,
    ukefExposure,
    coverStartDate: requestedCoverStartDate,
    ukefGuaranteeInMonths,
    // TODO simplify isIssued to just take 1 param, not object
    hasBeenIssued: isIssued(facility),
    hasBeenAcknowledged,
    coverEndDate: mapCoverEndDate(facility),
    guaranteeFeePayableByBank,
    dayCountBasis,
    feeFrequency,
    premiumFrequency,
    feeType,
    premiumType,
    tfm: facility.tfm,
  };
};


module.exports = {
  hasCoverEndDate,
  mapCoverEndDate,
  mapBssEwcsFacility,
};
