const CONSTANTS = require('../../../../constants');
const { formattedNumber } = require('../../../../utils/number');
const { capitalizeFirstLetter } = require('../../../../utils/string');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityStage = require('./mapFacilityStage');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapDates = require('./mapDates');

const mapFacility = (f, dealDetails) => {
  const facility = f;
  
  const {
    facilityType,
    facilityValue,
    facilityStage,
    guaranteeFeePayableByBank,
  } = facility;

  const ukefFacilityType = facilityType;

  const formattedFacilityValue = formattedNumber(facilityValue);

  facility.facilityProduct = mapFacilityProduct(facility);

  if (facility.facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    // only bonds have `bondType`
    facility.facilityType = facility.bondType;
  } else if (facility.facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    facility.facilityType = capitalizeFirstLetter(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
  } else {
    facility.facilityType = null;
  }

  facility.ukefExposure = `${facility.currency.id} ${facility.ukefExposure}`;
  facility.coveredPercentage = `${facility.coveredPercentage}%`;

  // DTFS-2727
  // for initial dev, only return facilityValue if currency is GBP.
  // TODO: until we figure out which API to use for conversion from non-GBP.
  if (facility.currency.id === 'GBP') {
    facility.facilityValue = `${facility.currency.id} ${formattedFacilityValue}`;
  } else {
    facility.facilityValue = '';
  }

  facility.facilityValueExportCurrency = `${facility.currency.id} ${formattedFacilityValue}`;

  facility.facilityStage = mapFacilityStage(facilityStage);

  return {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    ukefFacilityID: facility.ukefFacilityID,
    facilityType: facility.facilityType,
    ukefFacilityType,
    facilityProduct: facility.facilityProduct,
    facilityStage: facility.facilityStage,
    coveredPercentage: facility.coveredPercentage,
    facilityValueExportCurrency: facility.facilityValueExportCurrency,
    facilityValue: facility.facilityValue,
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
