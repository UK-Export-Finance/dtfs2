const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGefFacilityFeeType = require('./mapGefFacilityFeeType');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');

const mapGefFacility = (facility, dealSnapshot) => {
  // fields that need to be in GEF facility data
  // ukefFacilityID
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
    hasBeenIssued,
    name,
    monthsOfCover: ukefGuaranteeInMonths,
    type: facilityType,
  } = facilitySnapshot;

  const formattedFacilityValue = formattedNumber(value);

  facilitySnapshot.facilityProduct = mapFacilityProduct(facilityType);

  facilitySnapshot.facilityStage = mapFacilityStage(hasBeenIssued);

  const result = {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    facilitySnapshot: {
      _id: facility._id, // eslint-disable-line no-underscore-dangle
      associatedDealId,
      bankFacilityReference: name,
      banksInterestMargin: `${interestPercentage}%`,
      coveredPercentage: `${coverPercentage}%`,
      dates: mapGefFacilityDates(facilitySnapshot, facilityTfm, dealSnapshot),
      facilityProduct: facilitySnapshot.facilityProduct,
      facilityStage: facilitySnapshot.facilityStage,
      facilityType: mapFacilityType(facilitySnapshot),
      facilityValueExportCurrency: `${currency} ${formattedFacilityValue}`,
      facilityValue: mapFacilityValue(currency, formattedFacilityValue, facilityTfm),
      feeType: mapGefFacilityFeeType(paymentType),

      // TODO: we shouldn't need facilityType and ukefFacilityType.
      ukefFacilityType: mapGefUkefFacilityType(facilityType),
      ukefFacilityID: 'UKEF-ID-TODO',
      ukefGuaranteeInMonths,
    },
    tfm: facilityTfm,
  };

  return result;
};

module.exports = mapGefFacility;
