const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityValue = require('./mapFacilityValue');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapBanksInterestMargin = require('./mapBanksInterestMargin');
const mapFirstDrawdownAmountInExportCurrency = require('./mapFirstDrawdownAmountInExportCurrency');
const mapFeeType = require('./mapFeeType');
const mapFeeFrequency = require('./mapFeeFrequency');
const mapDates = require('./mapDates');
const mapUkefExposureValue = require('./mapUkefExposureValue');
const mapFacilityValueExportCurrency = require('./mapFacilityValueExportCurrency');
const { mapBssEwcsFacilityStage } = require('./mapFacilityStage');
const { mapBssEwcsFacilityType } = require('./mapFacilityType');

/**
 * Maps a BSS/EWCS facility snapshot in the database to the facility snapshot used in TFM-API and TFM-UI.
 * This function is only used on BSS/EWCS facilities.
 * This returns a facility object that represent the current facility state with all changes applied e.g. when amendments are added in TFM.
 * These values may differ from the facility snapshot in the database.
 * @param {import('@ukef/dtfs2-common').TfmFacility} facility the full facility object from the database
 * @param {import('@ukef/dtfs2-common').BssEwcsDeal} dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @returns {import('@ukef/dtfs2-common').MappedBssEwcsDealSnapshot}
 */
const mapFacilitySnapshot = (facility, dealSnapshot) => {
  const { details: dealDetails } = dealSnapshot;

  const { facilitySnapshot, tfm: facilityTfm } = facility;

  // Ensure facility is valid
  if (!facilitySnapshot) {
    return null;
  }

  // Deep clone
  const clonedSnapshot = JSON.parse(JSON.stringify(facilitySnapshot, null, 4));

  const {
    _id,
    ukefFacilityId,
    dealId,
    type,
    hasBeenIssued,
    value,
    facilityStage,
    guaranteeFeePayableByBank,
    currency,
    coveredPercentage,
    dayCountBasis,
    bondIssuer,
    bondBeneficiary,
  } = clonedSnapshot;

  clonedSnapshot.ukefFacilityType = type;

  clonedSnapshot.facilityProduct = mapFacilityProduct(type);

  clonedSnapshot.type = mapBssEwcsFacilityType(type, facilitySnapshot);

  const formattedFacilityValue = formattedNumber(value);

  const mappedFacilitySnapshot = {
    // Fields in common with all facility types
    _id,
    ukefFacilityId,
    dealId,
    isGef: false,
    type: clonedSnapshot.type,
    hasBeenIssued,

    ukefFacilityType: clonedSnapshot.ukefFacilityType, // TODO: DTFS2-4634 - we shouldn't need facility.type and ukefFacilityType.
    facilityStage: mapBssEwcsFacilityStage(facilityStage, facilityTfm?.facilityStage),
    facilityProduct: clonedSnapshot.facilityProduct,

    bankFacilityReference: mapBankFacilityReference(clonedSnapshot),
    banksInterestMargin: mapBanksInterestMargin(clonedSnapshot),

    currency: currency.id,
    coveredPercentage: `${coveredPercentage}%`,
    dayCountBasis: Number(dayCountBasis),

    facilityValueExportCurrency: mapFacilityValueExportCurrency(facility),
    value: mapFacilityValue(currency.id, formattedFacilityValue, facility),

    ukefExposure: mapUkefExposureValue(facilityTfm, facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),

    feeType: mapFeeType(clonedSnapshot),
    feeFrequency: mapFeeFrequency(clonedSnapshot),

    dates: mapDates(facility, clonedSnapshot, facilityTfm, dealDetails),

    // Mapped fields unique to BSS/EWCS facilities
    firstDrawdownAmountInExportCurrency: mapFirstDrawdownAmountInExportCurrency(clonedSnapshot),

    // Mapped fields unique to BSS/EWCS facilities - bond specifics
    bondIssuer,
    bondBeneficiary,
  };

  return mappedFacilitySnapshot;
};

module.exports = mapFacilitySnapshot;
