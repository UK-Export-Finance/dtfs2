const { isValid } = require('date-fns');
const { convertDateToTimestamp } = require('../../../utils/date');
const mapGefFacilityFeeType = require('../../../graphql/reducers/mappings/gef-facilities/mapGefFacilityFeeType');
const CONSTANTS = require('../../../constants');

const mapCoverStartDate = (facility) => {
  const { coverStartDate } = facility;

  if (coverStartDate && isValid(new Date(coverStartDate))) {
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
    feeType,
    feeFrequency,
    dayCountBasis,
    hasBeenIssuedAndAcknowledged,
    tfm,
  } = facility;

  const mapped = {
    _id,
    ukefFacilityId,
    type,
    currencyCode: currency.id,
    value,
    coverPercentage,
    hasBeenIssued,
    ukefGuaranteeInMonths: monthsOfCover || 0,
    ukefExposure,
    coverStartDate: mapCoverStartDate(facility),
    coverEndDate,
    bankReference: name,
    guaranteeFee,
    feeType: mapGefFacilityFeeType(feeType),
    feeFrequency,
    dayCountBasis,
    hasBeenIssuedAndAcknowledged,
    tfm,
  };

  // these extra fields are only used in GEF submission confirmation email
  mapped.interestPercentage = facility.interestPercentage;
  mapped.shouldCoverStartOnSubmission = facility.shouldCoverStartOnSubmission;
  mapped.facilityStage = mapFacilityStage(hasBeenIssued);

  // these extra fields are only used in GEF facility fee record calculation
  mapped.coverEndDateTimestamp = convertDateToTimestamp(coverEndDate);

  return mapped;
};

module.exports = {
  mapCoverStartDate,
  mapFacilityStage,
  mapCashContingentFacility,
};
