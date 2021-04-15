const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

const mapDealTfm = (dealTfm) => {
  const { supplyContractValueInGBP } = dealTfm;


  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
  };

  return result;
};

module.exports = mapDealTfm;
