const CONSTANTS = require('../../../../constants');
const { capitalizeFirstLetter } = require('../../../../utils/string');

const mapFacilityType = (facility) => {
  const { facilityProduct } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    return facility.bondType;
  }

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    return capitalizeFirstLetter(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
  }

  if (facilityProduct.name === CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH) {
    return `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH} facility`;
  }

  if (facilityProduct.name === CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT) {
    return `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT} facility`;
  }

  // TODO gef versions with facility at the end
  return null;
};

module.exports = mapFacilityType;
