const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

const mapDealTfm = (dealTfm) => {
  const { supplyContractValueInGBP } = dealTfm;

  console.log('dealsReducer - mapDealTfm - dealTfm \n', dealTfm);

  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
  };

  console.log('dealsReducer - mapDealTfm - result \n', result);
  return result;
};

module.exports = mapDealTfm;
