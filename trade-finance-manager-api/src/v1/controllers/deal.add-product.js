const api = require('../api');
const CONSTANTS = require('../../constants');

const mapDealProduct = (deal) => {
  const { dealType } = deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return CONSTANTS.DEALS.DEAL_TYPE.GEF;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const { facilities } = deal;

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
  }

  return null;
};

const addDealProduct = async (deal) => {
  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    tfm,
  } = deal;

  const dealUpdate = {
    tfm: {
      ...tfm,
      product: mapDealProduct(deal),
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};


module.exports = {
  mapDealProduct,
  addDealProduct,
};
