const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

const mapDealTfm = (deal) => {
  const { tfm: dealTfm } = deal;

  if (!dealTfm) {
    return null;
  }

  const { supplyContractValueInGBP } = dealTfm;

  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
  };

  return result;
};

module.exports = mapDealTfm;
