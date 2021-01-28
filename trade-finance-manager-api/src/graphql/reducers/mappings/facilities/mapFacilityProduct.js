const CONSTANTS = require('../../../../constants');

const mapFacilityProduct = (facility) => {
  let mapped;

  // facilityType will eventually be facilityProduct / facilityProductCode
  // TODO: refactor when DTFS2-3054 is completed.
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

  // currently, we don't always have facilityType.
  // this is a hacky fallback/workaround for initial TFM development.
  // TODO: remove this once DTFS2-3054 is completed.
  if (facility.bondType) {
    // only bonds have `bondType`
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND,
    };
  }
  if (facility.interestMarginFee) {
    // only loans have `interestMarginFee`
    mapped = {
      code: CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN,
      name: CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN,
    };
  }

  return mapped;
};

module.exports = mapFacilityProduct;
