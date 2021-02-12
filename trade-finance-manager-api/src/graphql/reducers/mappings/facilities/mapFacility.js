const CONSTANTS = require('../../../../constants');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityStage = require('./mapFacilityStage');
const mapCoverEndDate = require('./mapCoverEndDate');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');

const mapFacility = (f) => {
  const facility = f;

  const {
    facilityValue,
    facilityStage,
    guaranteeFeePayableByBank,
  } = facility;

  const formattedFacilityValue = formattedNumber(facilityValue);

  facility.facilityProduct = mapFacilityProduct(facility);

  if (facility.facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    // only bonds have `bondType`
    facility.facilityType = facility.bondType;
  } else {
    facility.facilityType = null;
  }

  facility.coverEndDate = mapCoverEndDate(facility);

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

  return {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    ukefFacilityID: facility.ukefFacilityID,
    facilityType: facility.facilityType,
    facilityStage: mapFacilityStage(facilityStage),
    facilityProduct: facility.facilityProduct,
    coverEndDate: facility.coverEndDate,
    coveredPercentage: facility.coveredPercentage,
    facilityValueExportCurrency: facility.facilityValueExportCurrency,
    facilityValue: facility.facilityValue,
    ukefExposure: facility.ukefExposure,
    bankFacilityReference: mapBankFacilityReference(facility),
    guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(guaranteeFeePayableByBank),
  };
};

module.exports = mapFacility;
