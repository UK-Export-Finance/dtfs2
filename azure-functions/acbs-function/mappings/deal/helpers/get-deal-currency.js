const CONSTANTS = require('../../../constants');
const { getBaseCurrency } = require('../../facility/helpers');

const getDealCurrency = (deal) => {
  // GEF
  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    let currency = getBaseCurrency(deal.dealSnapshot.facilities);
    currency = currency.id ? currency.id : currency;
    return !currency ? CONSTANTS.DEAL.CURRENCY.DEFAULT : currency;
  }
  // BSS/ECWS
  return (
    deal.dealSnapshot.submissionDetails.supplyContractCurrency
    && deal.dealSnapshot.submissionDetails.supplyContractCurrency.id
  );
};

module.exports = getDealCurrency;
