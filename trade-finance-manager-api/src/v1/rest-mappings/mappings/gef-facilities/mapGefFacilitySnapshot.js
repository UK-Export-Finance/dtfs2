const { formattedNumber } = require('../../../../utils/number');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapFacilityValueExportCurrency = require('../facilities/mapFacilityValueExportCurrency');
const mapUkefExposureValue = require('../facilities/mapUkefExposureValue');
const { mapGefFacilityStage } = require('../facilities/mapFacilityStage');

/**
 * Maps a GEF facility snapshot in the database to the facility snapshot used in TFM-API and TFM-UI.
 * This function is only used on GEF facilities.
 * This returns a facility object that represent the current facility state with all changes applied e.g. when amendments are added in TFM.
 * These values may differ from the facility snapshot in the database.
 * @param {import('@ukef/dtfs2-common').TfmFacility} facility the full facility object from the database
 * @param {import('@ukef/dtfs2-common').Deal} dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @returns mapped facility snapshot
 */
const mapGefFacilitySnapshot = (facility, dealSnapshot) => {
  const { facilitySnapshot, tfm: facilityTfm } = facility;

  const {
    _id,
    ukefFacilityId,
    dealId,
    type,
    hasBeenIssued,
    value,
    guaranteeFee,
    currency,
    coverPercentage,
    interestPercentage,
    feeType,
    feeFrequency,
    name,
    dayCountBasis,
    details,
    detailsOther,
  } = facilitySnapshot;

  const formattedFacilityValue = formattedNumber(value);

  facilitySnapshot.facilityProduct = mapFacilityProduct(type);

  facilitySnapshot.ukefFacilityType = type;

  const mappedFacilitySnapshot = {
    // Fields in common with all facility types
    _id,
    ukefFacilityId,
    dealId,
    isGef: true,
    type: mapFacilityType(facilitySnapshot),
    hasBeenIssued,

    ukefFacilityType: mapGefUkefFacilityType(type), // TODO: DTFS2-4634 - we shouldn't need type and ukefFacilityType.
    facilityStage: mapGefFacilityStage(hasBeenIssued, facilityTfm?.facilityStage),
    facilityProduct: facilitySnapshot.facilityProduct,

    bankFacilityReference: name,
    banksInterestMargin: `${interestPercentage}%`,

    currency: currency.id,
    coveredPercentage: `${coverPercentage}%`,
    dayCountBasis,

    facilityValueExportCurrency: mapFacilityValueExportCurrency(facility),
    value: mapFacilityValue(currency.id, formattedFacilityValue, facility),

    ukefExposure: mapUkefExposureValue(facilityTfm, facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFee),

    feeType,
    feeFrequency,

    dates: mapGefFacilityDates(facility, facilityTfm, dealSnapshot),

    // Mapped fields unique to GEF facilities
    providedOn: details,
    providedOnOther: detailsOther,
  };

  return mappedFacilitySnapshot;
};

module.exports = mapGefFacilitySnapshot;
