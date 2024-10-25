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

  const { dealId, coverPercentage, currency, value, interestPercentage, feeType, feeFrequency, hasBeenIssued, name, type, ukefFacilityId, guaranteeFee } =
    facilitySnapshot;

  const formattedFacilityValue = formattedNumber(value);

  facilitySnapshot.facilityProduct = mapFacilityProduct(type);

  facilitySnapshot.facilityStage = mapGefFacilityStage(hasBeenIssued);

  facilitySnapshot.ukefFacilityType = type;

  const mapped = {
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

  return mapped;
};

module.exports = mapGefFacilitySnapshot;
