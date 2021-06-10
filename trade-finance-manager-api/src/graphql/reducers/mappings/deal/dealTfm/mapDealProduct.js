const CONSTANTS = require('../../../../../constants');

const mapDealProduct = (dealTfm) => {
  const { facilities } = dealTfm;

  if (!facilities) {
    return null;
  }

  const bonds = facilities.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
  const loans = facilities.filter((f) => f.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  if (hasBonds && hasLoans) {
    return `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN}`;
  }

  if (hasBonds) {
    return CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND;
  }

  if (hasLoans) {
    return CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN;
  }

  return null;
};

module.exports = mapDealProduct;
