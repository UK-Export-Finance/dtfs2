const {
  fromUnixTime,
  getUnixTime,
  add,
} = require('date-fns');
const MIGRATION_MAP = require('./migration-map');
const V2_CONSTANTS = require('../../../portal-api/src/constants');
const { convertDateToTimestamp } = require('./helpers');

const mapHasBeenIssued = (v1Stage) => {
  if (v1Stage === 'Issued') {
    return true;
  }

  return false;
};

const mapFeeFrequency = (v1Frequency) => {
  if (v1Frequency && v1Frequency.length) {
    return v1Frequency;
  }

  return null;
};

const mapPaymentType = (v1PaymentType) => {
  if (v1PaymentType && v1PaymentType.length) {
    return v1PaymentType;
  }

  return null;
};

const mapBasisDetails = (v1Basis) => {
  const mapped = {
    details: [],
    detailsOther: null,
  };

  if (v1Basis) {
    v1Basis.forEach((v1) => {
      if (MIGRATION_MAP.FACILITIES.BASIS_DETAILS[v1.readable_value]) {
        // return MIGRATION_MAP.FACILITIES.BASIS_DETAILS[v1.readable_value];
        mapped.details.push(MIGRATION_MAP.FACILITIES.BASIS_DETAILS[v1.readable_value]);
      } else {
        mapped.details.push(V2_CONSTANTS.FACILITIES.GEF_FACILITY_PROVIDED_DETAILS.OTHER);
        mapped.detailsOther = v1.system_value;
      }
    }); 
  }

  return mapped;
};

const mapCoverDateConfirmed = (issued) => {
  if (issued) {
    return true;
  }

  return false;
};

const mapShouldCoverStartOnSubmission = (
    v2CoverStartDate,
  v2DealSubmissionDate
) => {
  if (v2CoverStartDate === v2DealSubmissionDate) {
    return true;
  }

  return false;
};


const mapCoverEndDate = (coverStartDate, exposurePeriod) => {
  const date = add(new Date(fromUnixTime(coverStartDate)), {
    months: exposurePeriod,
  });

  return getUnixTime(date);
};

const mapV1Facilities = (
  v1Facilities,
  v1DealUpdatedAt,
  v2DealSubmissionDate,
) => {
  const v2Facilities = v1Facilities.map((v1Facility) => {
    const hasBeenIssued = mapHasBeenIssued(v1Facility.facility_stage);
    const { details, detailsOther } = mapBasisDetails(v1Facility.facility_characteristics);
    const coverStartDate = v2DealSubmissionDate;

    const mapped = {
      dataMigration: {
        drupalFacilityId: String(v1Facility.drupal_facility_id),
      },
      type: MIGRATION_MAP.FACILITIES.TYPE[v1Facility.facility_type],
      ukefFacilityId: v1Facility.ukef_facility_id,
      name: v1Facility.bank_facility_number,
      hasBeenIssued,
      value: Number(v1Facility.amount),
      currency: { id: v1Facility.currency },
      coverPercentage: Number(v1Facility.guarantee_),
      interestPercentage: Number(v1Facility.interest_rate),
      feeType: v1Facility.premium_type.readable_value,
      paymentType: mapPaymentType(v1Facility.premium_frequency.readable_value),
      feeFrequency: mapFeeFrequency(v1Facility.premium_frequency.readable_value),
      dayCountBasis: Number(v1Facility.day_basis.readable_value),

      details,
      detailsOther,
      ukefExposure: Number(v1Facility.maximum_liability),
      guaranteeFee: Number(v1Facility.guarantee_fee_),
      monthsOfCover: Number(v1Facility.exposure_period),

      coverStartDate,
      coverEndDate: mapCoverEndDate(coverStartDate, Number(v1Facility.exposure_period)),
      coverDateConfirmed: mapCoverDateConfirmed(hasBeenIssued),
      shouldCoverStartOnSubmission: mapShouldCoverStartOnSubmission(
        coverStartDate,
        v2DealSubmissionDate,
      ),
      hasBeenIssuedAndAcknowledged: Boolean(v1Facility.stage_issued_acknowledged),
      updatedAt: convertDateToTimestamp(v1DealUpdatedAt),

    };

    if (hasBeenIssued) {
      mapped.issuedDate = convertDateToTimestamp(v1Facility.issue_date);
      mapped.submittedAsIssuedDate = convertDateToTimestamp(v1Facility.system_commitment_to_issued_date);
    }

    return mapped;
  });

  return v2Facilities;
};

module.exports = mapV1Facilities;
