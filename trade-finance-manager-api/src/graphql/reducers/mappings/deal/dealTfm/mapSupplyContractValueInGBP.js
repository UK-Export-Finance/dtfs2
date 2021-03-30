const { formattedNumber } = require('../../../../../utils/number');

const mapSupplyContractValueInGBP = (supplyContractValueInGBP) => {
  if (supplyContractValueInGBP) {
    return `GBP ${formattedNumber(supplyContractValueInGBP)}`;
  }

  return null;
};

module.exports = mapSupplyContractValueInGBP;
