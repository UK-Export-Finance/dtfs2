const CONSTANTS = require('../../../../constants');

const mapFacilityProduct = (facilityType) => {
  let mapped;

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
      displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
    };
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
      displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
    };
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH) {
    mapped = {
      // no official code so we use our own facilityType definition.
      code: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH,
      displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
    };
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT) {
    mapped = {
      // no official code so we use our own facilityType definition.
      code: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT,
      displayName: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.GEF,
    };
  }

  return mapped;
};

module.exports = mapFacilityProduct;
