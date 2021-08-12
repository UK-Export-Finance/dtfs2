const { convertDateToTimestamp } = require('../../../utils/date');

const mapCoverStartDate = (facility) => {
  const {
    hasBeenIssued,
    submittedAsIssuedDate,
    coverStartDate,
  } = facility;

  if (hasBeenIssued && submittedAsIssuedDate) {
    return submittedAsIssuedDate;
  }

  if (coverStartDate) {
    return convertDateToTimestamp(coverStartDate);
  }

  return null;
};

const mapCashContingentFacility = (facility) => {
  const {
    _id,
    ukefFacilityId,
    type,
    hasBeenIssued,
    value,
    currency,
    monthsOfCover,
    coverPercentage,
    ukefExposure,
    coverEndDate,
  } = facility;

  return {
    _id,
    ukefFacilityID: ukefFacilityId,
    facilityType: type,
    currencyCode: currency,
    value,
    coverPercentage,
    hasBeenIssued,
    ukefGuaranteeInMonths: monthsOfCover || 0,
    ukefExposure,
    coverStartDate: mapCoverStartDate(facility),
    coverEndDate,
    tfm: facility.tfm,
    // not in the data
    // premiumType,
    // dayCountBasis,
    // guaranteeFeePayableByBank,
  };
};


module.exports = {
  mapCoverStartDate,
  mapCashContingentFacility,
};
