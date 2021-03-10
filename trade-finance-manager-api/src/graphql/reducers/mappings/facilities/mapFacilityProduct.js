const CONSTANTS = require('../../../../constants');

const mapFacilityProduct = (facility) => {
  let mapped;

  if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
    };
  }

  if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
    };
  }

  return mapped;
};

module.exports = mapFacilityProduct;
