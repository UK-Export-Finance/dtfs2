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

const mapFacility = async (f, facilityTfm, dealDetails, facilityFull) => {
  // Deep clone
  const facility = JSON.parse(JSON.stringify(f, null, 4));

  const {
    type,
    value,
    facilityStage,
    guaranteeFeePayableByBank,
    currency,
  } = facility;

  facility.ukefFacilityType = type;

  facility.facilityProduct = mapFacilityProduct(type);

  facility.type = mapFacilityType(facility);

  const formattedFacilityValue = formattedNumber(value);

  facility.facilityStage = mapFacilityStage(facilityStage);

  const mapped = {
    _id: facility._id,
    dealId: facility.dealId,
    ukefFacilityId: facility.ukefFacilityId,

    // TODO: DTFS2-4634 - we shouldn't need facility.type and ukefFacilityType.
    type: facility.type,
    ukefFacilityType: facility.ukefFacilityType,
    facilityProduct: facility.facilityProduct,
    facilityStage: facility.facilityStage,
    hasBeenIssued: facility.hasBeenIssued,
    coveredPercentage: `${facility.coveredPercentage}%`,
    facilityValueExportCurrency: await mapFacilityValueExportCurrency(facilityFull),
    value: await mapFacilityValue(currency.id, formattedFacilityValue, facilityFull),
    currency: currency.id,
    ukefExposure: await mapUkefExposureValue(facilityTfm, facilityFull),
    bankFacilityReference: mapBankFacilityReference(facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),
    banksInterestMargin: mapBanksInterestMargin(facility),
    firstDrawdownAmountInExportCurrency: mapFirstDrawdownAmountInExportCurrency(facility),
    feeType: mapFeeType(facility),
    feeFrequency: mapFeeFrequency(facility),
    dayCountBasis: Number(facility.dayCountBasis),
    dates: await mapDates(facility, facilityTfm, dealDetails),

    // bond specifics
    bondIssuer: facility.bondIssuer,
    bondBeneficiary: facility.bondBeneficiary,
  };

  return mapped;
};

module.exports = mapFacility;
