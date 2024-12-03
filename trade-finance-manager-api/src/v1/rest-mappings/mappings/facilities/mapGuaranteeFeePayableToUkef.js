const { formattedNumber } = require('../../../../utils/number');

const mapGuaranteeFeePayableByBank = (guaranteeFee) => `${formattedNumber(guaranteeFee, 4, 4)}%`;

module.exports = mapGuaranteeFeePayableByBank;
