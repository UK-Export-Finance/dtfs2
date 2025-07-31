const { formattedNumber } = require('@ukef/dtfs2-common');

const mapGuaranteeFeePayableByBank = (guaranteeFee) => `${formattedNumber(guaranteeFee, 4, 4)}%`;

module.exports = mapGuaranteeFeePayableByBank;
