const moment = require('moment');
const isIssued = require('../../helpers/is-issued');

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
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = facility;

  return {
    _id,
    ukefFacilityID,
    facilityType,
    currency,
    value: facilityValue,
    coverPercentage: coveredPercentage,
    ukefExposure,
    coverStartDate: requestedCoverStartDate,
    ukefGuaranteeInMonths,
    // TODO simplify isIssued to just take 1 param, not object
    hasBeenIssued: isIssued(facility),
    hasBeenAcknowledged,
    coverEndDate: moment().set({
      date: Number(coverEndDateDay),
      month: Number(coverEndDateMonth) - 1, // months are zero indexed
      year: Number(coverEndDateYear),
    }),
    guaranteeFeePayableByBank,
    dayCountBasis,
    feeFrequency,
    premiumFrequency,
    feeType,
    premiumType,
    tfm: facility.tfm,
  };
};


module.exports = mapBssEwcsFacility;
