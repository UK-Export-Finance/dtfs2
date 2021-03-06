const CONSTANTS = require('../../../../constants');
const { formattedNumber } = require('../../../../utils/number');
const { capitalizeFirstLetter } = require('../../../../utils/string');
const mapFacilityProduct = require('./mapFacilityProduct');
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

  if (facility.facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    // only bonds have `bondType`
    facility.facilityType = facility.bondType;
  } else if (facility.facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    facility.facilityType = capitalizeFirstLetter(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
  } else {
    facility.facilityType = null;
  }

  facility.coveredPercentage = `${facility.coveredPercentage}%`;

  const formattedFacilityValue = formattedNumber(facilityValue);

  const mappedFacilityValue = mapFacilityValue(currency, formattedFacilityValue, facilityTfm);

  facility.facilityValueExportCurrency = `${currency.id} ${formattedFacilityValue}`;

  facility.facilityStage = mapFacilityStage(facilityStage);

  facility.ukefExposure = `${facility.currency.id} ${facility.ukefExposure}`;

  return {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    associatedDealId: facility.associatedDealId,
    ukefFacilityID: facility.ukefFacilityID,
    facilityType: facility.facilityType,
    ukefFacilityType,
    facilityProduct: facility.facilityProduct,
    facilityStage: facility.facilityStage,
    coveredPercentage: facility.coveredPercentage,
    facilityValueExportCurrency: facility.facilityValueExportCurrency,
    facilityValue: mappedFacilityValue,
    ukefExposure: facility.ukefExposure,
    bankFacilityReference: mapBankFacilityReference(facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),

    // bond specifics
    bondIssuer: facility.bondIssuer,
    bondBeneficiary: facility.bondBeneficiary,

    dates: mapDates(facility, dealDetails),
  };
};

module.exports = mapFacility;
