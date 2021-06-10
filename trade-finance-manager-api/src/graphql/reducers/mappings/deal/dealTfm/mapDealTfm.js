const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');
const mapDealProduct = require('./mapDealProduct');

const mapDealTfm = (deal) => {
  const {
    tfm: dealTfm,
  } = deal;

  const { supplyContractValueInGBP } = dealTfm;

  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
    product: mapDealProduct(dealTfm),
  };

  return result;
};

module.exports = mapDealTfm;
