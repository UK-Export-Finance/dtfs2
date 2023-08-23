const CONSTANTS = require('../../../../constants');

const mapFacilityProduct = (type) => {
  let mapped;

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
    };
  }

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
    };
  }

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.GEF,
    };
  }

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.GEF,
    };
  }

  return mapped;
};

module.exports = mapFacilityProduct;
