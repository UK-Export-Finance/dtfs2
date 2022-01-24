const CONSTANTS = require('../../../constants');

const dealProduct = (deal) => {
  const { dealType } = deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return CONSTANTS.DEALS.DEAL_TYPE.GEF;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const { facilities } = deal;

    const bonds = facilities.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
    const loans = facilities.filter((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

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
  }

  return null;
};

module.exports = dealProduct;
