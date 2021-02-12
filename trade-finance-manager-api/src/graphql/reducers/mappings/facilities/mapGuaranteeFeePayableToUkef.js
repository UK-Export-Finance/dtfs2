const { formattedNumber } = require('../../../../utils/number');

const mapGuaranteeFeePayableByBank = (guaranteeFeePayableByBank) =>
  `${formattedNumber(guaranteeFeePayableByBank)}%`;

module.exports = mapGuaranteeFeePayableByBank;
