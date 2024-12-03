const CONSTANTS = require('../../../../constants');

const mapBanksInterestMargin = (facility) => {
  const { facilityProduct } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
    return `${facility.riskMarginFee}%`;
  }

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    return `${facility.interestMarginFee}%`;
  }

  return null;
};

module.exports = mapBanksInterestMargin;
