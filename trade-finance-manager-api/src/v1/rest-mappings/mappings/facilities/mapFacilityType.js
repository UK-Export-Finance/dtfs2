const { FACILITY_TYPE, FACILITY_TYPE_MAPPED } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../../constants');

const mapFacilityType = (facility) => {
  const { facilityProduct, ukefFacilityType } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    return facility.bondType;
  }

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    return FACILITY_TYPE_MAPPED.LOAN;
  }

  if (ukefFacilityType === FACILITY_TYPE.CASH) {
    return FACILITY_TYPE_MAPPED.CASH;
  }

  if (ukefFacilityType === FACILITY_TYPE.CONTINGENT) {
    return FACILITY_TYPE_MAPPED.CONTINGENT;
  }

  return null;
};

module.exports = mapFacilityType;
