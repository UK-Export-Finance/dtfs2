const CONSTANTS = require('../../../../constants');

const mapFeeType = (facility) => {
  const { facilityProduct } = facility;

  if (facilityProduct.name === CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND) {
    return facility.feeType;
  }

  return facility.premiumType;
};

module.exports = mapFeeType;
