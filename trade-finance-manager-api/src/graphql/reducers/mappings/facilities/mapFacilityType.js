const CONSTANTS = require('../../../../constants');
const { capitalizeFirstLetter } = require('../../../../utils/string');

const mapFacilityType = (facility) => {
  const { facilityProduct } = facility;
  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    // only bonds have `bondType`
    return facility.bondType;
  }

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    return capitalizeFirstLetter(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
  }

  return null;
};

module.exports = mapFacilityType;
