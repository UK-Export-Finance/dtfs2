const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityType = require('./mapFacilityType');
const mapFacilityStage = require('./mapFacilityStage');
const mapFacilityValue = require('./mapFacilityValue');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
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

  const ukefFacilityType = facilityType;

  facility.facilityProduct = mapFacilityProduct(facility);

  facility.facilityType = mapFacilityType(facility);

  const formattedFacilityValue = formattedNumber(facilityValue);

  facility.facilityStage = mapFacilityStage(facilityStage);

  return {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    associatedDealId: facility.associatedDealId,
    ukefFacilityID: facility.ukefFacilityID,
    facilityType: facility.facilityType,
    ukefFacilityType,
    facilityProduct: facility.facilityProduct,
    facilityStage: facility.facilityStage,
    coveredPercentage: `${facility.coveredPercentage}%`,
    facilityValueExportCurrency: `${currency.id} ${formattedFacilityValue}`,
    facilityValue: mapFacilityValue(currency, formattedFacilityValue, facilityTfm),
    ukefExposure: `${facility.currency.id} ${facility.ukefExposure}`,
    bankFacilityReference: mapBankFacilityReference(facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),

    // bond specifics
    bondIssuer: facility.bondIssuer,
    bondBeneficiary: facility.bondBeneficiary,

    dates: mapDates(facility, dealDetails),
  };
};

module.exports = mapFacility;
