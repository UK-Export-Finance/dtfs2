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

const mapFacility = (f, facilityTfm, dealDetails) => {
  // Deep clone
  const facility = JSON.parse(JSON.stringify(f, null, 4));

  const {
    facilityType,
    facilityValue,
    facilityStage,
    guaranteeFeePayableByBank,
    currency,
  } = facility;

  facility.ukefFacilityType = facilityType;

  facility.facilityProduct = mapFacilityProduct(facilityType);

  facility.facilityType = mapFacilityType(facility);

  const formattedFacilityValue = formattedNumber(facilityValue);

  facility.facilityStage = mapFacilityStage(facilityStage);

  const mapped = {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    associatedDealId: facility.associatedDealId,
    ukefFacilityID: facility.ukefFacilityID,

    // TODO: DTFS2-4634 - we shouldn't need facilityType and ukefFacilityType.
    facilityType: facility.facilityType,
    ukefFacilityType: facility.ukefFacilityType,
    facilityProduct: facility.facilityProduct,
    facilityStage: facility.facilityStage,
    coveredPercentage: `${facility.coveredPercentage}%`,
    facilityValueExportCurrency: `${currency.id} ${formattedFacilityValue}`,
    facilityValue: mapFacilityValue(currency.id, formattedFacilityValue, facilityTfm),
    ukefExposure: `${facility.currency.id} ${facility.ukefExposure}`,
    bankFacilityReference: mapBankFacilityReference(facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),
    banksInterestMargin: mapBanksInterestMargin(facility),
    firstDrawdownAmountInExportCurrency: mapFirstDrawdownAmountInExportCurrency(facility),
    feeType: mapFeeType(facility),
    feeFrequency: mapFeeFrequency(facility),
    dayCountBasis: Number(facility.dayCountBasis),
    dates: mapDates(facility, facilityTfm, dealDetails),

    // bond specifics
    bondIssuer: facility.bondIssuer,
    bondBeneficiary: facility.bondBeneficiary,
  };

  return mapped;
};

module.exports = mapFacility;
