const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapFacilityValueExportCurrency = require('../facilities/mapFacilityValueExportCurrency');
const mapUkefExposureValue = require('../facilities/mapUkefExposureValue');

/**
 * Maps existing GEF facility to the facility used in TFM API.
 * Note: This implimentation modifies the facility snapshot
 * to have values not consistent with the facility snapshot in the database.
 */
const mapGefFacilitySnapshot = (facility, dealSnapshot) => {
  const { facilitySnapshot, tfm: facilityTfm } = facility;

  const { dealId, coverPercentage, currency, value, interestPercentage, feeType, feeFrequency, hasBeenIssued, name, type, ukefFacilityId, guaranteeFee } =
    facilitySnapshot;

  const formattedFacilityValue = formattedNumber(value);

  facilitySnapshot.facilityProduct = mapFacilityProduct(type);

  facilitySnapshot.facilityStage = mapFacilityStage(hasBeenIssued);

  facilitySnapshot.ukefFacilityType = type;

  return {
    _id: facility._id,
    isGef: true,
    dealId,
    bankFacilityReference: name,
    banksInterestMargin: `${interestPercentage}%`,
    coveredPercentage: `${coverPercentage}%`,
    dates: mapGefFacilityDates(facility, facilityTfm, dealSnapshot),
    facilityProduct: facilitySnapshot.facilityProduct,
    facilityStage: facilitySnapshot.facilityStage,
    hasBeenIssued: facilitySnapshot.hasBeenIssued,
    type: mapFacilityType(facilitySnapshot),
    currency: currency.id,
    facilityValueExportCurrency: mapFacilityValueExportCurrency(facility),
    value: mapFacilityValue(currency.id, formattedFacilityValue, facility),
    feeType,
    feeFrequency,
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFee),
    dayCountBasis: facilitySnapshot.dayCountBasis,

    // TODO: DTFS2-4634 - we shouldn't need type and ukefFacilityType.
    ukefFacilityType: mapGefUkefFacilityType(type),
    ukefFacilityId,
    ukefExposure: mapUkefExposureValue(facilityTfm, facility),
    providedOn: facilitySnapshot.details,
    providedOnOther: facilitySnapshot.detailsOther,
  };
};

module.exports = mapGefFacilitySnapshot;
