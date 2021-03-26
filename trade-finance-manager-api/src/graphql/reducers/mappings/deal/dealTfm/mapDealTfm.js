const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

const mapDealTfm = (dealTfm) => {
  const { supplyContractValueInGBP } = dealTfm;

  return {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
  };
};

module.exports = mapDealTfm;
