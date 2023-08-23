const CONSTANTS = require('../../../../constants');

const mapFeeFrequency = (facility) => {
  const { facilityProduct } = facility;

  if (facilityProduct.name === CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND) {
    return facility.feeFrequency;
  }

  return facility.premiumFrequency;
};

module.exports = mapFeeFrequency;
