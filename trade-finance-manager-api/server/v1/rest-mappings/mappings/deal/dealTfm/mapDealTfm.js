const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

const mapDealTfm = (deal) => {
  const { tfm: dealTfm } = deal;

  if (!dealTfm) {
    return false;
  }

  const { supplyContractValueInGBP } = dealTfm;

  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
  };

  return result;
};

module.exports = mapDealTfm;
