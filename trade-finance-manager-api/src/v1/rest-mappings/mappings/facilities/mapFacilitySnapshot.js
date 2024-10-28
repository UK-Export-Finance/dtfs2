const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityType = require('./mapFacilityType');
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

/**
 * Maps a BSS/EWCS facility snapshot in the database to the facility snapshot used in TFM-API and TFM-UI.
 * This function is only used on BSS/EWCS facilities.
 * This returns a facility object that represent the current facility state with all changes applied e.g. when amendments are added in TFM.
 * These values may differ from the facility snapshot in the database.
 * @param {import('@ukef/dtfs2-common').TfmFacility} facility the full facility object from the database
 * @param {import('@ukef/dtfs2-common').Deal} dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @returns mapped facility snapshot
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

  const { type, value, facilityStage, guaranteeFeePayableByBank, currency } = clonedSnapshot;

  clonedSnapshot.ukefFacilityType = type;

  clonedSnapshot.facilityProduct = mapFacilityProduct(type);

  clonedSnapshot.type = mapFacilityType(clonedSnapshot);

  const formattedFacilityValue = formattedNumber(value);

  clonedSnapshot.facilityStage = mapBssEwcsFacilityStage(facilityStage);

  const mapped = {
    _id: clonedSnapshot._id,
    isGef: false,
    dealId: clonedSnapshot.dealId,
    ukefFacilityId: clonedSnapshot.ukefFacilityId,

    // TODO: DTFS2-4634 - we shouldn't need facility.type and ukefFacilityType.
    type: clonedSnapshot.type,
    ukefFacilityType: clonedSnapshot.ukefFacilityType,
    facilityProduct: clonedSnapshot.facilityProduct,
    facilityStage: clonedSnapshot.facilityStage,
    hasBeenIssued: clonedSnapshot.hasBeenIssued,
    coveredPercentage: `${clonedSnapshot.coveredPercentage}%`,
    facilityValueExportCurrency: mapFacilityValueExportCurrency(facility),
    value: mapFacilityValue(currency.id, formattedFacilityValue, facility),
    currency: currency.id,
    ukefExposure: mapUkefExposureValue(facilityTfm, facility),
    bankFacilityReference: mapBankFacilityReference(clonedSnapshot),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),
    banksInterestMargin: mapBanksInterestMargin(clonedSnapshot),
    firstDrawdownAmountInExportCurrency: mapFirstDrawdownAmountInExportCurrency(clonedSnapshot),
    feeType: mapFeeType(clonedSnapshot),
    feeFrequency: mapFeeFrequency(clonedSnapshot),
    dayCountBasis: Number(clonedSnapshot.dayCountBasis),
    dates: mapDates(facility, clonedSnapshot, facilityTfm, dealDetails),

    // bond specifics
    bondIssuer: clonedSnapshot.bondIssuer,
    bondBeneficiary: clonedSnapshot.bondBeneficiary,
  };

  return mapped;
};

module.exports = mapFacilitySnapshot;
