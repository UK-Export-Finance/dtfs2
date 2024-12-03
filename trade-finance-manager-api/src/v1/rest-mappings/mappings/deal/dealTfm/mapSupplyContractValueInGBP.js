const { CURRENCY } = require('@ukef/dtfs2-common');
const { formattedNumber } = require('../../../../../utils/number');

const mapSupplyContractValueInGBP = (supplyContractValueInGBP) => {
  if (supplyContractValueInGBP) {
    return `${CURRENCY.GBP} ${formattedNumber(supplyContractValueInGBP)}`;
  }

  return null;
};

module.exports = mapSupplyContractValueInGBP;
