const { CURRENCY, formattedNumber } = require('@ukef/dtfs2-common');

const mapSupplyContractValueInGBP = (supplyContractValueInGBP) => {
  if (supplyContractValueInGBP) {
    return `${CURRENCY.GBP} ${formattedNumber(supplyContractValueInGBP)}`;
  }

  return null;
};

module.exports = mapSupplyContractValueInGBP;
