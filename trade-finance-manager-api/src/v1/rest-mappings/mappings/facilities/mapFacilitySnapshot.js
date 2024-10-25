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
 * Maps the existing facility snapshot in the database to the facility snapshot used in TFM API.
 * This function is only used on BSS/EWCS facilities.
 * Note: This implementation modifies the facility snapshot to have values not consistent with the facility snapshot in the database.
 * In particular, this is a live object that updates e.g. when amendments are added in TFM.
 */
const mapFacilitySnapshot = (facility, dealDetails) => {
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

  clonedSnapshot.facilityStage = mapBssEwcsFacilityStage(facilityStage, facilityTfm?.facilityStage);

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
