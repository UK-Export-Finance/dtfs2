const { formattedNumber } = require('../../../../../utils/number');
const { CURRENCY } = require('../../../../../constants/currency.constant');

const mapSupplyContractValueInGBP = (supplyContractValueInGBP) => {
  if (supplyContractValueInGBP) {
    return `${CURRENCY.GBP} ${formattedNumber(supplyContractValueInGBP)}`;
  }

  return null;
};

module.exports = mapSupplyContractValueInGBP;
