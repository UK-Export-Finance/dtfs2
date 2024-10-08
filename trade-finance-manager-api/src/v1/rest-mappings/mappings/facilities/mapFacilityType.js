const { FACILITY_TYPE, MAPPED_FACILITY_TYPE } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../../constants');

/**
 * Maps facility type to a different, tfm-api specific facility type.
 * Note there is a difference between this facility type, the input facility type,
 * and how the facility type is displayed in the front end.
 *
 * @returns {string} the mapped facility type
 *
 * @example
 * // returns 'Bid Bond'
 * mapFacilityType({...facility, code: 'BSS', bondType: 'Bid Bond'})
 *
 * @example
 * // returns 'Loan'
 * mapFacilityType({...facility, code: 'EWCS'})
 *
 * @example
 * // returns 'Cash Facility'
 * mapFacilityType({...facility, ukefFacilityType: 'Cash'})
 *
 * @example
 * // returns 'Contingent Facility'
 * mapFacilityType({...facility, ukefFacilityType: 'Contingent'})
 */
const mapFacilityType = (facility) => {
  const { facilityProduct, ukefFacilityType } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    return facility.bondType;
  }

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    return MAPPED_FACILITY_TYPE.LOAN;
  }

  if (ukefFacilityType === FACILITY_TYPE.CASH) {
    return MAPPED_FACILITY_TYPE.CASH;
  }

  if (ukefFacilityType === FACILITY_TYPE.CONTINGENT) {
    return MAPPED_FACILITY_TYPE.CONTINGENT;
  }

  return null;
};

module.exports = mapFacilityType;
