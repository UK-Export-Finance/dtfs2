const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../../constants');

const { BOND, LOAN, CASH, CONTINGENT } = FACILITY_TYPE;
const { FACILITY_PRODUCT_CODE, FACILITY_PRODUCT_NAME } = CONSTANTS.FACILITIES;

const mapFacilityProduct = (type) => {
  let mapped;

  if (type === BOND) {
    mapped = {
      code: FACILITY_PRODUCT_CODE.BOND,
      name: FACILITY_PRODUCT_NAME.BOND,
    };
  }

  if (type === LOAN) {
    mapped = {
      code: FACILITY_PRODUCT_CODE.LOAN,
      name: FACILITY_PRODUCT_NAME.LOAN,
    };
  }

  if (type === CASH) {
    mapped = {
      code: FACILITY_PRODUCT_CODE.GEF,
      name: FACILITY_PRODUCT_NAME.GEF,
    };
  }

  if (type === CONTINGENT) {
    mapped = {
      code: FACILITY_PRODUCT_CODE.GEF,
      name: FACILITY_PRODUCT_NAME.GEF,
    };
  }

  return mapped;
};

module.exports = mapFacilityProduct;
