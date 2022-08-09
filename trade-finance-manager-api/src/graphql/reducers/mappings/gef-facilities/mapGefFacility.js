const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapFacilityTfm = require('../facilities/mapFacilityTfm');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapFacilityValueExportCurrency = require('../facilities/mapFacilityValueExportCurrency');
const mapUkefExposureValue = require('../facilities/mapUkefExposureValue');

const mapGefFacility = async (facility, dealSnapshot, dealTfm) => {
  const {
    facilitySnapshot,
    tfm: facilityTfm,
  } = facility;

  const {
    dealId,
    coverPercentage,
    currency,
    value,
    interestPercentage,
    feeType,
    feeFrequency,
    hasBeenIssued,
    name,
    type,
    ukefFacilityId,
    guaranteeFee,
  } = facilitySnapshot;

  const formattedFacilityValue = formattedNumber(value);

  facilitySnapshot.facilityProduct = mapFacilityProduct(type);

  facilitySnapshot.facilityStage = mapFacilityStage(hasBeenIssued);

  facilitySnapshot.ukefFacilityType = type;

  const result = {
    _id: facility._id,
    facilitySnapshot: {
      _id: facility._id,
      dealId,
      bankFacilityReference: name,
      banksInterestMargin: `${interestPercentage}%`,
      coveredPercentage: `${coverPercentage}%`,
      dates: await mapGefFacilityDates(facilitySnapshot, facilityTfm, dealSnapshot),
      facilityProduct: facilitySnapshot.facilityProduct,
      facilityStage: facilitySnapshot.facilityStage,
      hasBeenIssued: facilitySnapshot.hasBeenIssued,
      type: mapFacilityType(facilitySnapshot),
      currency: currency.id,
      facilityValueExportCurrency: await mapFacilityValueExportCurrency(facility),
      value: await mapFacilityValue(currency.id, formattedFacilityValue, facility),
      feeType,
      feeFrequency,
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFee),
      dayCountBasis: facilitySnapshot.dayCountBasis,

      // TODO: DTFS2-4634 - we shouldn't need type and ukefFacilityType.
      ukefFacilityType: mapGefUkefFacilityType(type),
      ukefFacilityId,
      ukefExposure: await mapUkefExposureValue(facilityTfm, facility),
      providedOn: facilitySnapshot.details,
      providedOnOther: facilitySnapshot.detailsOther,
    },
    tfm: await mapFacilityTfm(facilityTfm, dealTfm, facility),
  };

  return result;
};

module.exports = mapGefFacility;
