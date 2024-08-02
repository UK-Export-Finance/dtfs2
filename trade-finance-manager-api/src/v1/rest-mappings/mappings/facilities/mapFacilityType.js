const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../../constants');

const mapFacilityType = (facility) => {
  const { facilityProduct, ukefFacilityType } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    return facility.bondType;
  }

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    return FACILITY_TYPE.LOAN;
  }

  if (ukefFacilityType === FACILITY_TYPE.CASH) {
    return `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH} facility`;
  }

  if (ukefFacilityType === FACILITY_TYPE.CONTINGENT) {
    return `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT} facility`;
  }

  return null;
};

module.exports = mapFacilityType;
