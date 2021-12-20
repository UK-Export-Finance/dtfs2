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
const mapGefFacilityProvidedOn = require('./mapGefFacilityProvidedOn');

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
    type: facilityType,
    ukefFacilityId,
    ukefExposure,
    guaranteeFee,
  } = facilitySnapshot;

  const formattedFacilityValue = formattedNumber(value);

  facilitySnapshot.facilityProduct = mapFacilityProduct(facilityType);

  facilitySnapshot.facilityStage = mapFacilityStage(hasBeenIssued);

  facilitySnapshot.ukefFacilityType = facilityType;

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
      facilityType: mapFacilityType(facilitySnapshot),
      currency: currency.id,
      facilityValueExportCurrency: `${currency.id} ${formattedFacilityValue}`,
      facilityValue: mapFacilityValue(currency.id, formattedFacilityValue, facilityTfm),
      feeType: mapGefFacilityFeeType(paymentType),
      feeFrequency,
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFee),
      dayCountBasis: facilitySnapshot.dayCountBasis,

      // TODO: DTFS2-4634 - we shouldn't need facilityType and ukefFacilityType.
      ukefFacilityType: mapGefUkefFacilityType(facilityType),
      ukefFacilityId,
      ukefExposure: `${currency.id} ${ukefExposure}`,
      providedOn: mapGefFacilityProvidedOn(facilitySnapshot.details),
      providedOnOther: facilitySnapshot.detailsOther,
    },
    tfm: mapFacilityTfm(facilityTfm, dealTfm),
  };

  return result;
};

module.exports = mapGefFacility;
