const { convertDateToTimestamp } = require('../../../utils/date');
const mapGefFacilityFeeType = require('../../../graphql/reducers/mappings/gef-facilities/mapGefFacilityFeeType');
const CONSTANTS = require('../../../constants');

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

const mapFacilityStage = (hasBeenIssued) => {
  if (hasBeenIssued) {
    return CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED;
  }

  return CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT;
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
    name,
    guaranteeFee,
    paymentType,
    feeFrequency,
    dayCountBasis,
    tfm,
  } = facility;

  const mapped = {
    _id,
    ukefFacilityID: Number(ukefFacilityId),
    facilityType: type,
    currencyCode: currency,
    value,
    coverPercentage,
    hasBeenIssued,
    ukefGuaranteeInMonths: monthsOfCover || 0,
    ukefExposure,
    coverStartDate: mapCoverStartDate(facility),
    coverEndDate,
    bankReference: name,
    guaranteeFee,
    feeType: mapGefFacilityFeeType(paymentType),
    feeFrequency,
    dayCountBasis,
    tfm,
  };

  // these extra fields are only used in GEF submission confirmation email
  mapped.interestPercentage = facility.interestPercentage;
  mapped.shouldCoverStartOnSubmission = facility.shouldCoverStartOnSubmission;
  mapped.facilityStage = mapFacilityStage(hasBeenIssued);

  return mapped;
};

module.exports = {
  mapCoverStartDate,
  mapFacilityStage,
  mapCashContingentFacility,
};
