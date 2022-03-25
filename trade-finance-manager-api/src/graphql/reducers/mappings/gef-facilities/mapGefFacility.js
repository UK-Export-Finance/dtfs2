const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapFacilityTfm = require('../facilities/mapFacilityTfm');
const mapGefFacilityFeeType = require('./mapGefFacilityFeeType');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');

const mapGefFacility = (facility, dealSnapshot, dealTfm) => {
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
    paymentType,
    feeFrequency,
    hasBeenIssued,
    name,
    type,
    ukefFacilityId,
    ukefExposure,
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
      dates: mapGefFacilityDates(facilitySnapshot, facilityTfm, dealSnapshot),
      facilityProduct: facilitySnapshot.facilityProduct,
      facilityStage: facilitySnapshot.facilityStage,
      hasBeenIssued: facilitySnapshot.hasBeenIssued,
      type: mapFacilityType(facilitySnapshot),
      currency: currency.id,
      facilityValueExportCurrency: `${currency.id} ${formattedFacilityValue}`,
      value: mapFacilityValue(currency.id, formattedFacilityValue, facilityTfm),
      feeType: mapGefFacilityFeeType(paymentType),
      feeFrequency,
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFee),
      dayCountBasis: facilitySnapshot.dayCountBasis,

      // TODO: DTFS2-4634 - we shouldn't need type and ukefFacilityType.
      ukefFacilityType: mapGefUkefFacilityType(type),
      ukefFacilityId,
      ukefExposure: `${currency.id} ${ukefExposure}`,
      providedOn: facilitySnapshot.details,
      providedOnOther: facilitySnapshot.detailsOther,
    },
    tfm: mapFacilityTfm(facilityTfm, dealTfm),
  };

  return result;
};

module.exports = mapGefFacility;
