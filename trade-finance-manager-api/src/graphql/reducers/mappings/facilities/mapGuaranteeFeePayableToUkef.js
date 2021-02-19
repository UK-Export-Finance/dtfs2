const { formattedNumber } = require('../../../../utils/number');

const mapGuaranteeFeePayableByBank = (guaranteeFeePayableByBank) =>
  `${formattedNumber(guaranteeFeePayableByBank, 4)}%`;

module.exports = mapGuaranteeFeePayableByBank;
