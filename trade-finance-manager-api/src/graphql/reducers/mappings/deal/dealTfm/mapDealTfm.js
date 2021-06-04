const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');
const mapDealProduct = require('./mapDealProduct');

const mapDealTfm = (deal) => {
  const {
    dealSnapshot,
    tfm: dealTfm,
  } = deal;

  const { supplyContractValueInGBP } = dealTfm;

  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
    product: mapDealProduct(dealSnapshot),
  };

  return result;
};

module.exports = mapDealTfm;
