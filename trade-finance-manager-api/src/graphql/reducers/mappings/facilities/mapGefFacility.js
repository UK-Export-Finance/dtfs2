const moment = require('moment');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('./mapFacilityStage');

const mapFacilityValue = require('./mapFacilityValue');
const mapCoverEndDate = require('./mapCoverEndDate');

const { convertDateToTimestamp } = require('../../../../utils/date');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityType = require('./mapFacilityType');
const mapGefFacilityFeeType = require('./mapGefFacilityFeeType');

const mapTenorDate = require('./mapTenorDate');

const mapGefFacility = (facility, dealSnapshot) => {
  // fields that need to be in GEF facility
  // these currently need GEF work in design, UI, API:
  // guaranteeFeePayableToUkef
  // feeFrequency
  // dayCountBasis

  const { facilitySnapshot } = facility;

  // mock facility.tfm until we have submission/facility.tfm working.
  const facilityTfm = {};

  const {
    associatedDealId,
    coverPercentage,
    currency,
    value,
    interestPercentage,
    paymentType,
    coverStartDate,
    coverEndDate,
    hasBeenIssued,
    name,
    monthsOfCover: ukefGuaranteeInMonths,
    type: facilityType,
    issuedFacilitySubmittedToUkefTimestamp,
  } = facilitySnapshot;

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealSnapshot;


  const formattedFacilityValue = formattedNumber(value);

  const facilityProduct = mapFacilityProduct(facilityType);

  const facilityStage = mapFacilityStage(hasBeenIssued);

  facilitySnapshot.facilityProduct = facilityProduct;

  const result = {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    facilitySnapshot: {
      _id: facility._id, // eslint-disable-line no-underscore-dangle
      associatedDealId,
      ukefFacilityID: 'UKEF-ID-TODO',
      facilityProduct,
      facilityType: mapFacilityType(facilitySnapshot),
      facilityStage,
      coveredPercentage: `${coverPercentage}%`,
      facilityValueExportCurrency: `${currency} ${formattedFacilityValue}`,
      facilityValue: mapFacilityValue(currency, formattedFacilityValue, facilityTfm),
      banksInterestMargin: `${interestPercentage}%`,
      feeType: mapGefFacilityFeeType(paymentType),
      dates: {
        inclusionNoticeReceived: manualInclusionNoticeSubmissionDate || dealSubmissionDate,
        bankIssueNoticeReceived: issuedFacilitySubmittedToUkefTimestamp,
        coverStartDate: convertDateToTimestamp(coverStartDate),
        coverEndDate: mapCoverEndDate(
          moment(coverEndDate).format('DD'),
          moment(coverEndDate).format('MM'),
          moment(coverEndDate).format('YYYY'),
        ),
        tenor: mapTenorDate(
          facilityStage,
          ukefGuaranteeInMonths,
          facilityTfm.exposurePeriodInMonths,
        ),
      },
      bankFacilityReference: name,
      ukefGuaranteeInMonths,
    },
    tfm: facilityTfm,
  };

  return result;
};

module.exports = mapGefFacility;
