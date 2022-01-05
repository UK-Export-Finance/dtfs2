const CONSTANTS = require('../../../constants');
const { getBaseCurrency } = require('../../facility/helpers');

const getDealCurrency = (deal) => {
  // GEF
  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    const currency = getBaseCurrency(deal.dealSnapshot.facilities);
    return !currency && !!currency.id ? CONSTANTS.DEAL.CURRENCY.DEFAULT : currency;
  }
  // BSS/ECWS
  return (
    deal.dealSnapshot.submissionDetails.supplyContractCurrency
    && deal.dealSnapshot.submissionDetails.supplyContractCurrency.id
  );
};

module.exports = getDealCurrency;
