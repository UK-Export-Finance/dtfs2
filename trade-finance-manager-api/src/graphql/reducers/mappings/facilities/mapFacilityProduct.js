const CONSTANTS = require('../../../../constants');

const mapFacilityProduct = (facilityType) => {
  let mapped;

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
    };
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
    };
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH,
    };
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT,
    };
  }

  return mapped;
};

module.exports = mapFacilityProduct;
