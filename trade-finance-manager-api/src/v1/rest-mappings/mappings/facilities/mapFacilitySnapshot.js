const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityType = require('./mapFacilityType');
const mapFacilityStage = require('./mapFacilityStage');
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
  const f = JSON.parse(JSON.stringify(facilitySnapshot, null, 4));

  const { type, value, facilityStage, guaranteeFeePayableByBank, currency } = f;

  f.ukefFacilityType = type;

  f.facilityProduct = mapFacilityProduct(type);

  f.type = mapFacilityType(f);

  const formattedFacilityValue = formattedNumber(value);

  f.facilityStage = mapFacilityStage(facilityStage);

  const mapped = {
    _id: f._id,
    isGef: false,
    dealId: f.dealId,
    ukefFacilityId: f.ukefFacilityId,

    // TODO: DTFS2-4634 - we shouldn't need facility.type and ukefFacilityType.
    type: f.type,
    ukefFacilityType: f.ukefFacilityType,
    facilityProduct: f.facilityProduct,
    facilityStage: f.facilityStage,
    hasBeenIssued: f.hasBeenIssued,
    coveredPercentage: `${f.coveredPercentage}%`,
    facilityValueExportCurrency: mapFacilityValueExportCurrency(facility),
    value: mapFacilityValue(currency.id, formattedFacilityValue, facility),
    currency: currency.id,
    ukefExposure: mapUkefExposureValue(facilityTfm, facility),
    bankFacilityReference: mapBankFacilityReference(f),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),
    banksInterestMargin: mapBanksInterestMargin(f),
    firstDrawdownAmountInExportCurrency: mapFirstDrawdownAmountInExportCurrency(f),
    feeType: mapFeeType(f),
    feeFrequency: mapFeeFrequency(f),
    dayCountBasis: Number(f.dayCountBasis),
    dates: mapDates(facility, f, facilityTfm, dealDetails),

    // bond specifics
    bondIssuer: f.bondIssuer,
    bondBeneficiary: f.bondBeneficiary,
  };

  return mapped;
};

module.exports = mapFacilitySnapshot;
