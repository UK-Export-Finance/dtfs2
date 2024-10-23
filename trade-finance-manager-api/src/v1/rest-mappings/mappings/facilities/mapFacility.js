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
 * Maps existing facility to the facility used in TFM API.
 * Note: This implementation modifies the facility snapshot to have values not consistent with the facility snapshot in the database.
 * In particular, this is a live object that updates e.g. when amendments are added in TFM.
 */
const mapFacility = (f, facilityTfm, dealDetails, facilityFull) => {
  // Ensure facility is valid
  if (!f) {
    return null;
  }

  // Deep clone
  const facility = JSON.parse(JSON.stringify(f, null, 4));

  const { type, value, facilityStage, guaranteeFeePayableByBank, currency } = facility;

  facility.ukefFacilityType = type;

  facility.facilityProduct = mapFacilityProduct(type);

  facility.type = mapFacilityType(facility);

  const formattedFacilityValue = formattedNumber(value);

  facility.facilityStage = mapBssEwcsFacilityStage(facilityStage, facilityTfm?.stage);

  const mapped = {
    _id: facility._id,
    isGef: false,
    dealId: facility.dealId,
    ukefFacilityId: facility.ukefFacilityId,

    // TODO: DTFS2-4634 - we shouldn't need facility.type and ukefFacilityType.
    type: facility.type,
    ukefFacilityType: facility.ukefFacilityType,
    facilityProduct: facility.facilityProduct,
    facilityStage: facility.facilityStage,
    hasBeenIssued: facility.hasBeenIssued,
    coveredPercentage: `${facility.coveredPercentage}%`,
    facilityValueExportCurrency: mapFacilityValueExportCurrency(facilityFull),
    value: mapFacilityValue(currency.id, formattedFacilityValue, facilityFull),
    currency: currency.id,
    ukefExposure: mapUkefExposureValue(facilityTfm, facilityFull),
    bankFacilityReference: mapBankFacilityReference(facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),
    banksInterestMargin: mapBanksInterestMargin(facility),
    firstDrawdownAmountInExportCurrency: mapFirstDrawdownAmountInExportCurrency(facility),
    feeType: mapFeeType(facility),
    feeFrequency: mapFeeFrequency(facility),
    dayCountBasis: Number(facility.dayCountBasis),
    dates: mapDates(facilityFull, facility, facilityTfm, dealDetails),

    // bond specifics
    bondIssuer: facility.bondIssuer,
    bondBeneficiary: facility.bondBeneficiary,
  };

  return mapped;
};

module.exports = mapFacility;
