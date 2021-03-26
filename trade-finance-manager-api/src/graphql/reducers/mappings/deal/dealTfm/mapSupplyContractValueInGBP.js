const { formattedNumber } = require('../../../../../utils/number');

const mapSupplyContractValueInGBP = (supplyContractValueInGBP) =>
  `GBP ${formattedNumber(supplyContractValueInGBP)}`;

module.exports = mapSupplyContractValueInGBP;
